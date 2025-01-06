from enum import Enum

class UserRole(str, Enum):
    ADMIN = "admin"
    DIRECTOR = "director"
    MANAGER = "manager"
    DEVELOPER = "developer"
    ANALYST = "analyst"

class Project(str, Enum):
    HIMS = "HIMS"
    ISPK = "ISPK"
    RASUMI = "Rasumi"
    MDI = "MDI"
    EROSES = "Eroses"
    MYASSESSMENT = "MyAssessement"
    MYCUKAI = "MyCukai" 