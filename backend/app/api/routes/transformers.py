from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.transformer import Transformer
from app.schemas.transformer import TransformerResponse, TransformerCreate, TransformerUpdate

router = APIRouter(prefix="/transformers", tags=["Transformers"])

@router.get("", response_model=List[TransformerResponse])
def get_transformers(db: Session = Depends(get_db)):
    return db.query(Transformer).all()

@router.get("/{transformer_id}", response_model=TransformerResponse)
def get_transformer(transformer_id: str, db: Session = Depends(get_db)):
    tx = (
        db.query(Transformer)
        .filter(
            (Transformer.id == transformer_id) | (Transformer.transformer_code == transformer_id)
        )
        .first()
    )
    if not tx:
        raise HTTPException(status_code=44, detail="Transformer not found")
    return tx

@router.post("", response_model=TransformerResponse)
def create_transformer(tx_in: TransformerCreate, db: Session = Depends(get_db)):
    existing = db.query(Transformer).filter(Transformer.transformer_code == tx_in.transformer_code).first()
    if existing:
        raise HTTPException(status_code=400, detail="Transformer code already exists")
    
    tx = Transformer(**tx_in.model_dump())
    db.add(tx)
    db.commit()
    db.refresh(tx)
    return tx

@router.put("/{transformer_id}", response_model=TransformerResponse)
def update_transformer(transformer_id: str, tx_in: TransformerUpdate, db: Session = Depends(get_db)):
    tx = db.query(Transformer).filter(Transformer.id == transformer_id).first()
    if not tx:
        raise HTTPException(status_code=404, detail="Transformer not found")
    
    update_data = tx_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(tx, field, value)
        
    db.commit()
    db.refresh(tx)
    return tx
