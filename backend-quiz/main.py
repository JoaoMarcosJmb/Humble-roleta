from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional

app = FastAPI()

# --- CONFIGURAÇÕES ---
ADMIN_PASSWORD = "humbleadmin"  # <--- Mude sua senha aqui se quiser
origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- DADOS EM MEMÓRIA ---
players_db = {}
game_state = {
    "status": "WAITING",  # Pode ser: WAITING, RUNNING, FINISHED
    "current_question": 0
}


# --- MODELOS ---
class PlayerStart(BaseModel):
    username: str


class AnswerSubmission(BaseModel):
    username: str
    question_id: int
    is_correct: bool
    time_left: int


class AdminCommand(BaseModel):
    password: str


# --- ENDPOINTS ---

# [NOVO] Rota Raiz para teste rápido
@app.get("/")
def home():
    return {"status": "online", "message": "API do Humble Quiz rodando!"}


@app.get("/status")
def get_status():
    """O Frontend consulta isso a cada 2 segundos para saber se começou"""
    return game_state


@app.post("/join")
def join_game(player: PlayerStart):
    """Jogador entra na sala de espera"""
    if game_state["status"] != "WAITING":
        # Se quiser bloquear entrada após inicio, descomente abaixo:
        # raise HTTPException(status_code=400, detail="O jogo já começou!")
        pass

    if player.username not in players_db:
        players_db[player.username] = {"score": 0, "history": []}
    return {"message": "Entrou no lobby", "username": player.username}


@app.post("/submit")
def submit_answer(submission: AnswerSubmission):
    if submission.username not in players_db:
        raise HTTPException(status_code=404, detail="Jogador não encontrado")

    # Lógica de pontuação (Base 100 + Tempo)
    points = 0
    if submission.is_correct:
        points = 100 + (submission.time_left * 10)

    players_db[submission.username]["score"] += points
    return {"current_score": players_db[submission.username]["score"]}


@app.get("/leaderboard")
def get_leaderboard():
    ranking = sorted(
        [{"username": k, "score": v["score"]} for k, v in players_db.items()],
        key=lambda x: x["score"],
        reverse=True
    )
    return ranking[:3]


# --- ENDPOINTS DE ADMIN (PROTEGIDOS POR SENHA) ---

@app.post("/admin/start")
def start_game(cmd: AdminCommand):
    if cmd.password != ADMIN_PASSWORD:
        raise HTTPException(status_code=403, detail="Senha incorreta")
    game_state["status"] = "RUNNING"
    return {"message": "Jogo iniciado!"}


@app.post("/admin/reset")
def reset_game(cmd: AdminCommand):
    """Zera tudo para jogar de novo"""
    if cmd.password != ADMIN_PASSWORD:
        raise HTTPException(status_code=403, detail="Senha incorreta")

    global players_db
    players_db = {}
    game_state["status"] = "WAITING"
    return {"message": "Jogo resetado!"}