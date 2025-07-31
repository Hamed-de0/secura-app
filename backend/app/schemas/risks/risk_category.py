from pydantic import BaseModel
from typing import Optional, List


class RiskScenarioSubcategoryBase(BaseModel):
    name_en: str
    name_de: Optional[str] = None
    description_en: Optional[str] = None
    description_de: Optional[str] = None
    category_id: int


class RiskScenarioSubcategoryCreate(RiskScenarioSubcategoryBase):
    pass


class RiskScenarioSubcategoryUpdate(BaseModel):
    name_en: Optional[str] = None
    name_de: Optional[str] = None
    description_en: Optional[str] = None
    description_de: Optional[str] = None
    category_id: Optional[int] = None


class RiskScenarioSubcategory(RiskScenarioSubcategoryBase):
    id: int

    class Config:
        from_attributes = True


class RiskScenarioCategoryBase(BaseModel):
    name_en: str
    name_de: Optional[str] = None
    description_en: Optional[str] = None
    description_de: Optional[str] = None


class RiskScenarioCategoryCreate(RiskScenarioCategoryBase):
    pass


class RiskScenarioCategoryUpdate(BaseModel):
    name_en: Optional[str] = None
    name_de: Optional[str] = None
    description_en: Optional[str] = None
    description_de: Optional[str] = None


class RiskScenarioCategory(RiskScenarioCategoryBase):
    id: int
    subcategories: List[RiskScenarioSubcategory] = []

    class Config:
        from_attributes = True

