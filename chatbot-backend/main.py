import os
from dotenv import load_dotenv
from datetime import datetime
from typing import Optional, List
from contextlib import asynccontextmanager

# --- Importaciones de FastAPI y LangChain ---
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage, AIMessage

# --- Importaciones de SQLModel (ORM) ---
from sqlmodel import Field, SQLModel, select
from sqlalchemy.ext.asyncio import create_async_engine
from sqlmodel.ext.asyncio.session import AsyncSession

# ==============================
# 1. Configuración de la DB
# ==============================
DB_FILE = "chat.db"
DB_URL = f"sqlite+aiosqlite:///{DB_FILE}" 

# 'echo=False' para no llenar la consola con logs de SQL
engine = create_async_engine(DB_URL, echo=False) 

# Variable para nuestro fallback
DB_ENABLED = False

# ==============================
# 2. Definición de Modelos
# ==============================

# --- Modelo de la Base de Datos (SQLModel) ---
# Esta es la definición de nuestra tabla 'message'
class Message(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str = Field(index=True) # index=True hace más rápidas las búsquedas
    sender: str
    text: str
    timestamp: datetime = Field(default_factory=datetime.utcnow, nullable=False)

# --- Modelos de la API (Pydantic) ---
# Lo que el frontend envía y recibe.
class ChatMessage(BaseModel):
    sender: str  # 'user' o 'bot'
    text: str

class ChatHistoryRequest(BaseModel):
    history: List[ChatMessage] # Usar List de 'typing' es más compatible
    user_id: str

# Modelo para la respuesta del chat
class ChatResponse(BaseModel):
    reply: str

# ==============================
# 3. LLM y Sistema
# ==============================
load_dotenv()

if not os.getenv("GROQ_API_KEY"):
    raise EnvironmentError("La variable GROQ_API_KEY no está definida en el .env")

llm = ChatOpenAI(
    model_name="openai/gpt-oss-120b",
    openai_api_key=os.getenv("GROQ_API_KEY"),
    openai_api_base="https://api.groq.com/openai/v1",
    temperature=0
)

SYSTEM_INSTRUCTION = (
    "Eres un modelo de ayuda psicológica. Tu objetivo es dar consejos "
    "buenos, empáticos y seguros. Eres un asistente de apoyo. "
    "Responde siempre de forma amable."
)

# ==============================
# 4. Lifespan
# ==============================
async def create_db_and_tables():
    """
    Se ejecuta al inicio para crear la tabla si no existe.
    """
    global DB_ENABLED
    try:
        async with engine.begin() as conn:
            await conn.run_sync(SQLModel.metadata.create_all)
        DB_ENABLED = True
        print(f"INFO:     Conexión con SQLite ('{DB_FILE}') exitosa. Persistencia habilitada.")
    except Exception as e:
        DB_ENABLED = False
        print(f"ADVERTENCIA: No se pudo conectar a SQLite. Persistencia DESHABILITADA.")
        print(f"Error: {e}")

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Maneja los eventos de inicio y apagado de la aplicación.
    """
    print("INFO:     Iniciando aplicación...")
    await create_db_and_tables() # Llama a la función de startup
    yield
    # Código de Shutdown iría aquí si fuera necesario
    print("INFO:     Apagando aplicación...")

# ==============================
# 5. Iniciar la aplicación FastAPI
# ==============================
app = FastAPI(
    title="Chatbot API",
    description="API para conectar el frontend del chatbot con Groq",
    lifespan=lifespan # Así se usa el 'lifespan'
)

# ==============================
# 6. CORS
# ==============================
origins = [
    "http://localhost",
    "http://localhost:3000",
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==============================
# 7. Endpoint: Cargar Historial (con ORM)
# ==============================
@app.get("/history/{user_id}", response_model=List[ChatMessage])
async def get_history(user_id: str):
    """
    Devuelve el historial de chat para un usuario específico.
    """
    if not DB_ENABLED:
        return [] # Fallback si la DB falló al iniciar

    try:
        # 'AsyncSession' es la forma de hablar con la DB
        async with AsyncSession(engine) as session:
            # 1. Construye la consulta (statement)
            statement = select(Message).where(Message.user_id == user_id).order_by(Message.timestamp)
            
            # 2. Ejecuta la consulta
            results = await session.exec(statement)
            
            # 3. Obtiene todos los mensajes
            messages_from_db = results.all()
            
            # 4. Convierte los 'Message' (de DB) a 'ChatMessage' (de API)
            return [{"sender": msg.sender, "text": msg.text} for msg in messages_from_db]
            
    except Exception as e:
        print(f"ERROR: No se pudo leer el historial: {e}")
        # Si falla la lectura, devuelve vacío para que la app no se caiga
        return []

# ==============================
# 8. Endpoint: Chat (con ORM)
# ==============================
@app.post("/chat", response_model=ChatResponse)
async def handle_chat(request: ChatHistoryRequest):
    """
    Recibe un HISTORIAL de chat, lo procesa, y GUARDA con el ORM.
    """
    try:
        # --- 1. Lógica del LLM (Sin cambios) ---
        messages_for_llm = [SystemMessage(content=SYSTEM_INSTRUCTION)]
        for msg in request.history:
            if msg.sender == 'user':
                messages_for_llm.append(HumanMessage(content=msg.text))
            elif msg.sender == 'bot':
                messages_for_llm.append(AIMessage(content=msg.text))
        
        respuesta_llm = await llm.ainvoke(messages_for_llm) # .ainvoke para asíncrono
        bot_reply_text = respuesta_llm.content
        
        # El último mensaje del historial es el que acaba de enviar el usuario
        user_message_text = request.history[-1].text

        # --- 2. Lógica de guardado en DB (con ORM) ---
        if DB_ENABLED:
            try:
                # Prepara los objetos ORM para la DB
                user_msg_db = Message(user_id=request.user_id, sender='user', text=user_message_text)
                bot_msg_db = Message(user_id=request.user_id, sender='bot', text=bot_reply_text)

                async with AsyncSession(engine) as session:
                    # Añade los nuevos mensajes a la sesión
                    session.add(user_msg_db)
                    session.add(bot_msg_db)
                    # Confirma la transacción (guarda en la DB)
                    await session.commit()
                    
            except Exception as e:
                # Si falla el guardado, la app no se cae, solo avisa en consola.
                print(f"ADVERTENCIA: No se pudo guardar el mensaje en la DB: {e}")

        # --- 3. Devolver respuesta ---
        return {"reply": bot_reply_text}

    except Exception as e:
        print(f"Error al procesar el chat: {e}")
        raise HTTPException(status_code=500, detail="Hubo un problema al contactar al asistente.")