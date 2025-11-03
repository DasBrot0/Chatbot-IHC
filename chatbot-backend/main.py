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
from sqlmodel import Field, SQLModel, select, Session, delete
from sqlalchemy.ext.asyncio import create_async_engine
from sqlmodel.ext.asyncio.session import AsyncSession

# ==============================
# 1. Configuración de la DB
# ==============================
DB_FILE = "chat.db"
DB_URL = f"sqlite+aiosqlite:///{DB_FILE}" 
engine = create_async_engine(DB_URL, echo=False) 
DB_ENABLED = False

# ==============================
# 2. Definición de Modelos
# ==============================

# --- Modelo de la Base de Datos (SQLModel) ---

# Modelo para las conversaciones
class Conversation(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str = Field(index=True)
    title: str = Field(default="Nueva Conversación")
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)

# Modelo de Mensaje
class Message(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    conversation_id: int = Field(foreign_key="conversation.id", index=True)
    sender: str
    text: str
    timestamp: datetime = Field(default_factory=datetime.utcnow, nullable=False)

# --- Modelos de la API (Pydantic) ---
class ChatMessage(BaseModel):
    sender: str
    text: str

# Modelo de Petición de Chat
class ChatRequest(BaseModel):
    history: List[ChatMessage]
    user_id: str
    conversation_id: Optional[int] = None # puede ser nulo (para chats nuevos)

# Modelo de Respuesta del Chat
class ChatResponse(BaseModel):
    reply: str
    conversation_id: int        # Devolvemos el ID
    conversation_title: str   # Devolvemos el título (para la sidebar)

# Modelo para la lista de la sidebar
class ConversationInfo(BaseModel):
    id: int
    title: str
    created_at: datetime

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
    "Eres Amiguito, un modelo de ayuda psicológica. Tu objetivo es dar consejos "
    "buenos, empáticos y seguros. Eres un asistente de apoyo. "
    "Responde siempre de forma amable."
)

# ==============================
# 4. Lifespan
# ==============================
# create_db_and_tables creará AMBAS tablas (Conversation y Message)
# gracias a SQLModel.metadata.create_all
async def create_db_and_tables():
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
    print("INFO:     Iniciando aplicación...")
    await create_db_and_tables()
    yield
    print("INFO:     Apagando aplicación...")

# ==============================
# 5. Iniciar la aplicación FastAPI
# ==============================
app = FastAPI(
    title="Chatbot API",
    description="API para conectar el frontend del chatbot con Groq",
    lifespan=lifespan
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
# 7. Nuevos Endpoints
# ==============================

# Endpoint para la Sidebar
@app.get("/conversations/{user_id}", response_model=List[ConversationInfo])
async def get_conversations(user_id: str):
    """
    Devuelve todas las conversaciones de un usuario para la sidebar.
    """
    if not DB_ENABLED: return []
    try:
        async with AsyncSession(engine) as session:
            statement = select(Conversation).where(Conversation.user_id == user_id).order_by(Conversation.created_at.desc())
            results = await session.exec(statement)
            conversations = results.all()
            return conversations
    except Exception as e:
        print(f"ERROR: No se pudo leer lista de conversaciones: {e}")
        return []

# Endpoint de Historial
@app.get("/history/{conversation_id}", response_model=List[ChatMessage])
async def get_history(conversation_id: int): # Ahora busca por conversation_id
    """
    Devuelve el historial de chat para una conversación específica.
    """
    if not DB_ENABLED: return []
    try:
        async with AsyncSession(engine) as session:
            statement = select(Message).where(Message.conversation_id == conversation_id).order_by(Message.timestamp)
            results = await session.exec(statement)
            messages_from_db = results.all()
            return [{"sender": msg.sender, "text": msg.text} for msg in messages_from_db]
    except Exception as e:
        print(f"ERROR: No se pudo leer el historial: {e}")
        return []

# Endpoint para borrar
@app.delete("/conversation/{conversation_id}", status_code=204)
async def delete_conversation(conversation_id: int):
    """
    Borra una conversación y todos sus mensajes.
    """
    if not DB_ENABLED:
        raise HTTPException(status_code=500, detail="Base de datos no disponible")
    
    try:
        async with AsyncSession(engine) as session:
            # 1. Borrar mensajes (por la llave foránea)
            msg_statement = delete(Message).where(Message.conversation_id == conversation_id)
            await session.exec(msg_statement)
            
            # 2. Borrar la conversación
            conv_statement = delete(Conversation).where(Conversation.id == conversation_id)
            await session.exec(conv_statement)
            
            await session.commit()
        return None # Devuelve 204 No Content
    except Exception as e:
        print(f"ERROR: No se pudo borrar la conversación: {e}")
        raise HTTPException(status_code=500, detail="Error al borrar")


# ==============================
# 8. Endpoint: Chat
# ==============================
@app.post("/chat", response_model=ChatResponse)
async def handle_chat(request: ChatRequest): # Modelo de request actualizado
    """
    Recibe un historial, lo procesa, y crea/actualiza la conversación.
    """
    try:
        # --- 1. Lógica del LLM (Sin cambios) ---
        messages_for_llm = [SystemMessage(content=SYSTEM_INSTRUCTION)]
        for msg in request.history:
            if msg.sender == 'user':
                messages_for_llm.append(HumanMessage(content=msg.text))
            elif msg.sender == 'bot':
                messages_for_llm.append(AIMessage(content=msg.text))
        
        respuesta_llm = await llm.ainvoke(messages_for_llm)
        bot_reply_text = respuesta_llm.content
        
        user_message_text = request.history[-1].text
        current_conversation_id = request.conversation_id
        conversation_title = "Nueva Conversación"

        if not DB_ENABLED:
            return ChatResponse(reply=bot_reply_text, conversation_id=-1, conversation_title="Error DB")

        # --- 2. Lógica de guardado en DB ---
        async with AsyncSession(engine) as session:
            conversation: Optional[Conversation] = None
            
            # Si ya tenemos un ID, buscamos la conversación
            if current_conversation_id:
                conversation = await session.get(Conversation, current_conversation_id)
            
            # Si no hay ID o no se encontró, creamos una nueva
            if not conversation:
                # Generamos un título con el primer mensaje
                title = user_message_text[:50] + "..." if len(user_message_text) > 50 else user_message_text
                
                conversation = Conversation(
                    user_id=request.user_id,
                    title=title
                )
                session.add(conversation)
                await session.commit() # Guardamos para obtener el ID
                await session.refresh(conversation) # Obtenemos el ID generado

            # Obtenemos el ID y título confirmados
            current_conversation_id = conversation.id
            conversation_title = conversation.title

            # Guardamos los mensajes vinculados al ID de la conversación
            user_msg_db = Message(conversation_id=current_conversation_id, sender='user', text=user_message_text)
            bot_msg_db = Message(conversation_id=current_conversation_id, sender='bot', text=bot_reply_text)

            session.add(user_msg_db)
            session.add(bot_msg_db)
            await session.commit()
            
        # --- 3. Devolver respuesta ---
        return ChatResponse(
            reply=bot_reply_text,
            conversation_id=current_conversation_id,
            conversation_title=conversation_title
        )

    except Exception as e:
        print(f"Error al procesar el chat: {e}")
        raise HTTPException(status_code=500, detail="Hubo un problema al contactar al asistente.")