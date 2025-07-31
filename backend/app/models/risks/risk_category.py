from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.core.base import BaseMain

class RiskScenarioCategory(BaseMain):
    __tablename__ = "risk_scenario_categories"
    id = Column(Integer, primary_key=True)
    name_en = Column(String(200), nullable=False)
    name_de = Column(String(200), nullable=True)
    description_en = Column(String(500), nullable=True)
    description_de = Column(String(500), nullable=True)
    subcategories = relationship("RiskScenarioSubcategory", back_populates="category")

class RiskScenarioSubcategory(BaseMain):
    __tablename__ = "risk_scenario_subcategories"
    id = Column(Integer, primary_key=True)
    category_id = Column(Integer, ForeignKey("risk_scenario_categories.id"))
    name_en = Column(String(200), nullable=False)
    name_de = Column(String(200), nullable=True)
    description_en = Column(String(500), nullable=True)
    description_de = Column(String(500), nullable=True)
    category = relationship("RiskScenarioCategory", back_populates="subcategories")
    scenarios = relationship("RiskScenario", back_populates="subcategory")
