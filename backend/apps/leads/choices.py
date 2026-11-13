"""Valeurs fermées partagées avec le front.

Les codes (à gauche) sont stables et utilisés tels quels par le site
(`content/services/*.json`, formulaires). Les libellés affichés aux visiteurs
viennent des fichiers de traduction du front ; ceux d'ici servent à l'admin.
"""

from django.db import models


class Locale(models.TextChoices):
    FR = "fr", "Français"
    EN = "en", "English"


class Service(models.TextChoices):
    INDUSTRIAL_SAFETY = "industrial-safety", "Sécurité industrielle"
    OHS = "occupational-health-safety", "Santé et sécurité au travail"
    CONSULTING = "consulting", "Conseil"
    HAZARD_STUDIES = "hazard-studies", "Études de dangers"
    ESIA = "esia", "Études d'impact environnemental et social"
    RISK_TRAINING = "risk-training", "Formation aux risques industriels"
    ENVIRONMENTAL_MANAGEMENT = "environmental-management", "Gestion de l'environnement"
    INDUSTRIAL_QUALITY = "industrial-quality", "Qualité industrielle"
    PROJECT_STUDIES = "project-studies", "Études de projet"
    OTHER = "other", "Autre / je ne sais pas"


class Sector(models.TextChoices):
    OIL_GAS = "oil-gas", "Pétrole et gaz"
    MINING = "mining", "Mines et carrières"
    ENERGY = "energy", "Énergie"
    AGRIFOOD = "agrifood", "Agroalimentaire"
    CHEMICALS = "chemicals", "Chimie"
    CONSTRUCTION = "construction", "BTP"
    MANUFACTURING = "manufacturing", "Industrie manufacturière"
    LOGISTICS = "logistics", "Ports et logistique"
    PUBLIC = "public", "Secteur public"
    OTHER = "other", "Autre"


class SiteSize(models.TextChoices):
    SMALL = "small", "Moins de 50 personnes"
    MEDIUM = "medium", "50 à 250 personnes"
    LARGE = "large", "Plus de 250 personnes"
    MULTI = "multi", "Plusieurs sites"


class AppointmentMode(models.TextChoices):
    VIDEO = "video", "Visioconférence"
    PHONE = "phone", "Téléphone"
    ON_SITE = "on-site", "Dans nos locaux"


class AcademyProfile(models.TextChoices):
    STUDENT = "student", "Étudiant"
    PROFESSIONAL = "professional", "Professionnel"
    COMPANY = "company", "Entreprise"


class LeadStatus(models.TextChoices):
    NEW = "new", "Nouvelle"
    IN_PROGRESS = "in-progress", "En cours"
    CLOSED = "closed", "Clôturée"
