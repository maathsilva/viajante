from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey
from .database import Base

class Cliente(Base):
    __tablename__ = "clientes"
    cliente = Column(String, primary_key=True, index=True)
    tipo_cliente = Column(String)
    uf = Column(String, index=True)
    tempo_parceria_anos = Column(Integer)

class Destino(Base):
    __tablename__ = "destinos"
    destino = Column(String, primary_key=True, index=True)
    continente = Column(String)
    pais = Column(String)
    cambio_medio_2024 = Column(Float)

class Reserva(Base):
    __tablename__ = "reservas"
    id_reserva = Column(Integer, primary_key=True, index=True)
    dt_reserva = Column(DateTime)
    dt_embarque = Column(DateTime)
    cliente = Column(String, ForeignKey("clientes.cliente"))
    destino = Column(String, ForeignKey("destinos.destino"))
    receita = Column(Float)
    custo = Column(Float)
    canal_venda = Column(String, index=True)
    vendedor = Column(String)
    tipo_viagem = Column(String)