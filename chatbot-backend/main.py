import os
import re
from dotenv import load_dotenv
from datetime import datetime
from typing import Optional, List
from contextlib import asynccontextmanager

# --- Importaciones de FastAPI y LangChain ---
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage, AIMessage

# --- Importaciones de SQLModel (ORM) ---
from sqlmodel import Field, SQLModel, select, delete
from sqlalchemy.ext.asyncio import create_async_engine
from sqlmodel.ext.asyncio.session import AsyncSession

# --- Seguridad (Usando bcrypt nativo) ---
import bcrypt

# ==============================
# 1. Configuración de la DB
# ==============================
load_dotenv()

DB_USER = os.getenv("POSTGRES_USER", "postgres")
DB_PASSWORD = os.getenv("POSTGRES_PASSWORD", "")
DB_HOST = os.getenv("POSTGRES_HOST", "localhost")
DB_PORT = os.getenv("POSTGRES_PORT", "5432")
DB_NAME = os.getenv("POSTGRES_DB", "chatbot_db")

ALT_DB_URL = f"postgresql+asyncpg://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
DB_URL = os.getenv("DB_URL", ALT_DB_URL)
engine = create_async_engine(DB_URL, echo=False, pool_pre_ping=True)
DB_ENABLED = False

# ==============================
# 2. Definición de Modelos
# ==============================

class User(SQLModel, table=True):
    __tablename__ = "users"
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(unique=True, index=True)
    hashed_password: str
    # CAMBIO: Ahora por defecto es True para que entren directo
    is_verified: bool = Field(default=True) 
    created_at: datetime = Field(default_factory=datetime.utcnow)
    theme_mode: str = Field(default="dark")
    primary_color: str = Field(default="#2196f3")

class UserSettingsUpdate(BaseModel):
    theme_mode: str
    primary_color: str

# --- ELIMINADA LA TABLA VerificationToken ---

class Conversation(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str = Field(index=True)
    title: str = Field(default="Nueva Conversación")
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)

class Message(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    conversation_id: int = Field(foreign_key="conversation.id", index=True)
    sender: str
    text: str
    timestamp: datetime = Field(default_factory=datetime.utcnow, nullable=False)

# ==============================
# 3. Modelos de la API (Pydantic)
# ==============================

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class AuthResponse(BaseModel):
    message: str
    email: Optional[str] = None
    user_id: Optional[int] = None

class ChatMessage(BaseModel):
    sender: str
    text: str

class ChatRequest(BaseModel):
    history: List[ChatMessage]
    user_id: str
    conversation_id: Optional[int] = None

class ChatResponse(BaseModel):
    reply: str
    options: List[str] = []
    conversation_id: int
    conversation_title: str

class ConversationInfo(BaseModel):
    id: int
    title: str
    created_at: datetime

# ==============================
# 4. Funciones de Utilidad (Con bcrypt nativo)
# ==============================

def hash_password(password: str) -> str:
    pwd_bytes = password.encode('utf-8')
    if len(pwd_bytes) > 72:
        pwd_bytes = pwd_bytes[:72]
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(pwd_bytes, salt)
    return hashed.decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    pwd_bytes = plain_password.encode('utf-8')
    if len(pwd_bytes) > 72:
        pwd_bytes = pwd_bytes[:72]
    hash_bytes = hashed_password.encode('utf-8')
    return bcrypt.checkpw(pwd_bytes, hash_bytes)

# --- ELIMINADAS FUNCIONES DE EMAIL Y TOKEN ---

# ==============================
# 5. LLM y Sistema
# ==============================

if not os.getenv("GROQ_API_KEY"):
    raise EnvironmentError("La variable GROQ_API_KEY no está definida en el .env")

llm = ChatOpenAI(
    model_name="openai/gpt-oss-120b",
    openai_api_key=os.getenv("GROQ_API_KEY"),
    openai_api_base="https://api.groq.com/openai/v1",
    temperature=0
)

SYSTEM_INSTRUCTION = (
    """
    ERES: IA Boy, un compañero virtual de apoyo emocional disponible 24/7.
    TU MISIÓN: Ofrecer acompañamiento inmediato, validación emocional y herramientas de bienestar en un espacio seguro y libre de juicios.

    PERSONALIDAD Y TONO (CLAVE PARA GENERAR CONFIANZA):
    1.  **Cálido y Natural:** Habla como un amigo comprensivo, no como un robot. Usa un lenguaje cercano y suave. Evita frases prefabricadas rígidas.
    2.  **Positivo y Calmado:** Tu tono debe transmitir paz. Incluso ante situaciones difíciles, mantén la serenidad para no escalar la ansiedad del usuario.
    3.  **Empático y Curioso:** No solo des consejos. Haz preguntas suaves para entender cómo se siente realmente el usuario (ej: "¿Cómo te hace sentir eso?", "¿Hay algo específico que te preocupe hoy?"). Hazle sentir escuchado y comprendido.

    REGLAS DE INTERACCIÓN (PARA NO ABRUMAR):
    1.  **Brevedad y Claridad:** El usuario puede tener poco tiempo o sentirse abrumado. Tus respuestas deben ser concisas, directas y fáciles de leer. Evita parrafadas largas o explicaciones complejas.
    2.  **Enfoque Práctico:** Cuando sea oportuno, sugiere ejercicios breves de respiración, *grounding* (tocar tierra), mindfulness o relajación que el usuario pueda hacer en ese mismo instante.

    PROTOCOLOS DE SEGURIDAD (OBLIGATORIO):
    1.  **Límites Claros:** No eres un psicólogo clínico ni un médico. Si te piden un diagnóstico, aclara amablemente tu rol de acompañante.
    2.  **Detección de Crisis:** Si identificas señales de riesgo inminente (ideación suicida, autolesiones, violencia), DEBES:
        * Validar el dolor sin juzgar.
        * No intentar resolver la crisis tú solo.
        * **Proporcionar inmediatamente recursos de ayuda humana:** Sugiere contactar a servicios de emergencia o líneas de ayuda locales.
        * Ejemplo: "Siento mucho dolor en tus palabras y quiero que estés a salvo. Por favor, contacta a [Línea de Ayuda] o ve a urgencias. No tienes que pasar por esto solo/a."

    EJEMPLO DE FLUJO IDEAL:
    Usuario: "Me siento muy ansioso y no tengo tiempo para nada."
    IA Boy: "Entiendo que te sientas así, la presión del tiempo puede ser agobiante. Estoy aquí contigo. ¿Te ayudaría hacer una pausa de 1 minuto para respirar juntos ahora mismo?"
    
    IMPORTANTE - SUGERENCIAS DE RESPUESTA:
    Para facilitar la conversación, al final de cada respuesta, DEBES sugerir 2 o 3 opciones breves de lo que el usuario podría responderte.
    El formato debe ser ESTRICTAMENTE este al final del texto:
    [[Opción 1 | Opción 2 | Opción 3]]
    """
    )

# ==============================
# 6. Lifespan
# ==============================
async def create_db_and_tables():
    global DB_ENABLED
    try:
        async with engine.begin() as conn:
            await conn.run_sync(SQLModel.metadata.create_all)
        DB_ENABLED = True
        print(f"INFO:     Conexión con PostgreSQL exitosa. Persistencia habilitada.")
        print(f"INFO:     Base de datos: {DB_NAME} en {DB_HOST}:{DB_PORT}")
    except Exception as e:
        DB_ENABLED = False
        print(f"ADVERTENCIA: No se pudo conectar a PostgreSQL. Persistencia DESHABILITADA.")
        print(f"Error: {e}")

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("INFO:     Iniciando aplicación...")
    await create_db_and_tables()
    yield
    print("INFO:     Apagando aplicación...")
    await engine.dispose()

# ==============================
# 7. Iniciar la aplicación FastAPI
# ==============================
app = FastAPI(
    title="Chatbot API",
    description="API para conectar el frontend del chatbot con Groq",
    lifespan=lifespan
)

# ==============================
# 8. CORS
# ==============================
origins = [
    "https://dasbrot0.github.io",
    "http://localhost:5173", 
    "http://localhost:5174"
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=3600,
)

# ==============================
# 9. Endpoints de Autenticación
# ==============================

@app.post("/auth/register", response_model=AuthResponse)
async def register(request: RegisterRequest):
    if not DB_ENABLED:
        raise HTTPException(status_code=500, detail="Base de datos no disponible")
    
    async with AsyncSession(engine) as session:
        statement = select(User).where(User.email == request.email)
        result = await session.exec(statement)
        existing_user = result.first()
        
        if existing_user:
            raise HTTPException(status_code=400, detail="El email ya está registrado")
        
        hashed_pw = hash_password(request.password)
        
        # AQUÍ ESTÁ EL CAMBIO CLAVE: is_verified=True
        new_user = User(
            email=request.email, 
            hashed_password=hashed_pw,
            is_verified=True # Usuario verificado automáticamente
        )
        
        session.add(new_user)
        await session.commit()
        await session.refresh(new_user)
        
        # Eliminamos toda la lógica de token y email
        
        return AuthResponse(
            message="Registro exitoso. ¡Bienvenido!",
            email=request.email
        )

# --- ELIMINADO ENDPOINT /auth/verify ---

@app.post("/auth/login", response_model=AuthResponse)
async def login(request: LoginRequest):
    if not DB_ENABLED:
        raise HTTPException(status_code=500, detail="Base de datos no disponible")
    
    async with AsyncSession(engine) as session:
        statement = select(User).where(User.email == request.email)
        result = await session.exec(statement)
        user = result.first()
        
        if not user:
            raise HTTPException(status_code=401, detail="Credenciales inválidas")
        
        if not verify_password(request.password, user.hashed_password):
            raise HTTPException(status_code=401, detail="Credenciales inválidas")
        
        # ELIMINADA LA COMPROBACIÓN if not user.is_verified
        
        return AuthResponse(
            message="Inicio de sesión exitoso",
            email=user.email,
            user_id=user.id
        )

# ==============================
# 10. Endpoints de Chat
# ==============================

@app.get("/conversations/{user_id}", response_model=List[ConversationInfo])
async def get_conversations(user_id: str):
    if not DB_ENABLED: 
        return []
    try:
        async with AsyncSession(engine) as session:
            statement = select(Conversation).where(
                Conversation.user_id == user_id
            ).order_by(Conversation.created_at.desc())
            results = await session.exec(statement)
            conversations = results.all()
            return conversations
    except Exception as e:
        print(f"ERROR: No se pudo leer lista de conversaciones: {e}")
        return []

@app.get("/history/{conversation_id}", response_model=List[ChatMessage])
async def get_history(conversation_id: int):
    if not DB_ENABLED: 
        return []
    try:
        async with AsyncSession(engine) as session:
            statement = select(Message).where(
                Message.conversation_id == conversation_id
            ).order_by(Message.timestamp)
            results = await session.exec(statement)
            messages_from_db = results.all()
            return [
                {"sender": msg.sender, "text": msg.text} 
                for msg in messages_from_db
            ]
    except Exception as e:
        print(f"ERROR: No se pudo leer el historial: {e}")
        return []

@app.delete("/conversation/{conversation_id}", status_code=204)
async def delete_conversation(conversation_id: int):
    if not DB_ENABLED:
        raise HTTPException(
            status_code=500, 
            detail="Base de datos no disponible"
        )
    
    try:
        async with AsyncSession(engine) as session:
            msg_statement = delete(Message).where(
                Message.conversation_id == conversation_id
            )
            await session.exec(msg_statement)
            
            conv_statement = delete(Conversation).where(
                Conversation.id == conversation_id
            )
            await session.exec(conv_statement)
            
            await session.commit()
        return None
    except Exception as e:
        print(f"ERROR: No se pudo borrar la conversación: {e}")
        raise HTTPException(status_code=500, detail="Error al borrar")

@app.post("/chat", response_model=ChatResponse)
async def handle_chat(request: ChatRequest):
    try:
        messages_for_llm = [SystemMessage(content=SYSTEM_INSTRUCTION)]
        for msg in request.history:
            if msg.sender == 'user':
                messages_for_llm.append(HumanMessage(content=msg.text))
            elif msg.sender == 'bot':
                messages_for_llm.append(AIMessage(content=msg.text))
        
        respuesta_llm = await llm.ainvoke(messages_for_llm)
        raw_content = respuesta_llm.content
        
        # --- LÓGICA PARA EXTRAER OPCIONES ---
        options = []
        clean_reply = raw_content
        
        match = re.search(r"\[\[(.*?)\]\]", raw_content)
        if match:
            options_str = match.group(1)
            options = [opt.strip() for opt in options_str.split("|")]
            clean_reply = raw_content.replace(match.group(0), "").strip()

        user_message_text = request.history[-1].text
        current_conversation_id = request.conversation_id
        conversation_title = "Nueva Conversación"

        if not DB_ENABLED:
            return ChatResponse(
                reply=clean_reply, 
                options=options,
                conversation_id=-1, 
                conversation_title="Error DB"
            )

        async with AsyncSession(engine) as session:
            conversation: Optional[Conversation] = None
            
            if current_conversation_id:
                conversation = await session.get(Conversation, current_conversation_id)
            
            if not conversation:
                title = (user_message_text[:50] + "..." if len(user_message_text) > 50 else user_message_text)
                conversation = Conversation(user_id=request.user_id, title=title)
                session.add(conversation)
                await session.commit()
                await session.refresh(conversation)

            current_conversation_id = conversation.id
            conversation_title = conversation.title

            user_msg_db = Message(conversation_id=current_conversation_id, sender='user', text=user_message_text)
            bot_msg_db = Message(conversation_id=current_conversation_id, sender='bot', text=clean_reply)

            session.add(user_msg_db)
            session.add(bot_msg_db)
            await session.commit()
            
        return ChatResponse(
            reply=clean_reply,
            options=options,
            conversation_id=current_conversation_id,
            conversation_title=conversation_title
        )

    except Exception as e:
        print(f"Error al procesar el chat: {e}")
        raise HTTPException(status_code=500, detail="Hubo un problema al contactar al asistente.")
    
# ==============================
# 11. Endpoints de config de usuario
# ==============================

@app.get("/user/{user_id}/settings")
async def get_user_settings(user_id: str): 
    # Validación de seguridad
    if not user_id.isdigit():
        return {"theme_mode": "dark", "primary_color": "#2196f3"}
    
    # Convertimos a ENTERO
    uid_int = int(user_id)

    if not DB_ENABLED: 
        return {"theme_mode": "dark", "primary_color": "#2196f3"}
    
    async with AsyncSession(engine) as session:
        user = await session.get(User, uid_int)
        
        if not user:
            return {"theme_mode": "dark", "primary_color": "#2196f3"}
        return {"theme_mode": user.theme_mode, "primary_color": user.primary_color}

@app.put("/user/{user_id}/settings")
async def update_user_settings(user_id: str, settings: UserSettingsUpdate):
    if not user_id.isdigit():
        return {"message": "Guest settings not saved"}

    # Convertimos a ENTERO
    uid_int = int(user_id)

    if not DB_ENABLED: 
        return {"msg": "DB disabled"}

    async with AsyncSession(engine) as session:
        user = await session.get(User, uid_int)
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
            
        user.theme_mode = settings.theme_mode
        user.primary_color = settings.primary_color
        
        session.add(user)
        await session.commit()
        return {"message": "Settings updated"}