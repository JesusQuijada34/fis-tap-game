import os
from pathlib import Path
from tempfile import TemporaryDirectory

with TemporaryDirectory() as temp:
    os.environ["DATABASE_URL"] = f"sqlite:///{Path(temp) / 'fis.db'}"
    os.environ["FLASK_ENV"] = "testing"
    from app import app, db, User, CharacterState

    app.config.update(TESTING=True)
    with app.app_context():
        db.create_all()
        user = User(telegram_id="smoke-user", username="smoke", saldo_fis=1.0)
        db.session.add(user)
        db.session.commit()
        state = CharacterState(user_id=user.id)
        db.session.add(state)
        db.session.commit()
        user_id = user.id

    client = app.test_client()
    assert client.get("/api/config").status_code == 200
    assert len(client.get("/api/config").get_json()["RANKS"]) == 30
    for amount in (-1, 0, "nan", "not-a-number"):
        response = client.post("/api/retirar-fis", json={"user_id": user_id, "amount": amount})
        assert response.status_code == 400, (amount, response.status_code, response.get_json())
    response = client.post("/api/retirar-fis", json={"user_id": user_id, "amount": 2.0})
    assert response.status_code == 400

print("FIS_TAP_SECURITY_SMOKE_OK")
