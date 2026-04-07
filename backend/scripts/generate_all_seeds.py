#!/usr/bin/env python3
"""Generate all backend/ui_app_defaults/*.json from app-design reference data."""
from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SEED = ROOT / "ui_app_defaults"


def dump(name: str, data: object) -> None:
    SEED.mkdir(parents=True, exist_ok=True)
    (SEED / f"{name}.json").write_text(
        json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    print(f"Wrote {name}.json")


def main() -> None:
    gen_v2 = Path(__file__).resolve().parent / "generate_activity_v2_seed.py"
    if gen_v2.exists():
        subprocess.run([sys.executable, str(gen_v2)], check=True)

    # --- catalogs.json (LogSheet + milestone meta + diaper extras) ---
    catalogs = {
        "logTypes": [
            {"id": "feeding", "label": "Alimentação", "icon": "Milk", "color": "bg-baby-peach"},
            {"id": "hydration", "label": "Hidratação", "icon": "Droplets", "color": "bg-baby-blue"},
            {"id": "sleep", "label": "Sono", "icon": "Moon", "color": "bg-baby-lavender"},
            {"id": "diaper", "label": "Fralda", "icon": "Diaper", "color": "bg-baby-yellow"},
            {"id": "activity", "label": "Atividade", "icon": "Activity", "color": "bg-baby-mint"},
            {"id": "bath", "label": "Banho", "icon": "Bath", "color": "bg-baby-blue"},
            {"id": "health", "label": "Saúde", "icon": "Pill", "color": "bg-baby-pink"},
        ],
        "feedingTypes": [
            {"id": "breast", "label": "Amamentação"},
            {"id": "bottle", "label": "Mamadeira"},
            {"id": "formula", "label": "Fórmula"},
            {"id": "solids", "label": "Sólidos"},
        ],
        "formulaBrands": [
            "NAN 1", "NAN 2", "Aptamil 1", "Aptamil 2",
            "Enfamil", "Similac", "Nestogeno", "Outra",
        ],
        "drinkTypes": [
            {"id": "water", "label": "Água", "icon": "GlassWater"},
            {"id": "juice", "label": "Suco", "icon": "CupSoda"},
            {"id": "tea", "label": "Chá", "icon": "Coffee"},
            {"id": "other", "label": "Outro", "icon": "Droplets"},
        ],
        "quickAmounts": [30, 60, 90, 120, 150, 180],
        "sleepTypes": [
            {"id": "night", "label": "Noturno", "icon": "Moon"},
            {"id": "nap", "label": "Cochilo", "icon": "Sun"},
        ],
        "sleepLocations": ["Berço", "Colo", "Carrinho", "Cama", "Rede", "Outro"],
        "diaperTypes": [
            {"id": "pee", "label": "Xixi"},
            {"id": "poo", "label": "Cocô"},
            {"id": "mixed", "label": "Misto"},
        ],
        "volumeLabels": {"1": "Pouco", "2": "Normal", "3": "Bastante", "4": "Muito cheio"},
        "volumeLabelsLogSheet": {"1": "Pouco", "2": "Normal", "3": "Bastante", "4": "Muito"},
        "volumeColors": {
            "1": "bg-baby-blue/20 text-baby-blue",
            "2": "bg-baby-blue/40 text-baby-blue",
            "3": "bg-baby-blue/60 text-white",
            "4": "bg-baby-blue text-white",
        },
        "pooVolumeColors": {
            "1": "bg-amber-100 text-amber-600",
            "2": "bg-amber-200 text-amber-700",
            "3": "bg-amber-300 text-amber-800",
            "4": "bg-amber-400 text-white",
        },
        "bathTemps": [
            {"id": "frio", "label": "Frio", "icon": "❄"},
            {"id": "morno", "label": "Morno", "icon": "🌡"},
            {"id": "quente", "label": "Quente", "icon": "♨"},
        ],
        "bathDurations": [5, 10, 15, 20, 25, 30],
        "activityTypes": [
            {"id": "tummy", "label": "Bruços", "icon": "Baby"},
            {"id": "reading", "label": "Leitura", "icon": "BookOpen"},
            {"id": "music", "label": "Música", "icon": "Music"},
            {"id": "play", "label": "Brincar", "icon": "Footprints"},
            {"id": "walk", "label": "Passeio", "icon": "TreePalm"},
            {"id": "visual", "label": "Est. Visual", "icon": "Eye"},
            {"id": "auditory", "label": "Est. Auditivo", "icon": "Ear"},
            {"id": "spatial", "label": "Est. Espacial", "icon": "Move3d"},
            {"id": "other", "label": "Mais", "icon": "MoreHorizontal"},
        ],
        "activityOptions": [
            {"id": "tummy", "label": "Bruços", "icon": "Baby"},
            {"id": "reading", "label": "Leitura", "icon": "BookOpen"},
            {"id": "music", "label": "Música", "icon": "Music"},
            {"id": "play", "label": "Brincar", "icon": "Footprints"},
            {"id": "walk", "label": "Passeio", "icon": "TreePalm"},
            {"id": "visual", "label": "Visual", "icon": "Eye"},
            {"id": "auditory", "label": "Auditivo", "icon": "Ear"},
            {"id": "spatial", "label": "Motor", "icon": "Move3d"},
        ],
        "activityDurationOptions": [5, 10, 15, 20, 30, 45, 60],
        "healthSubTypes": [
            {"id": "vitamin", "label": "Vitamina"},
            {"id": "medication", "label": "Medicamento"},
        ],
        "milestoneCategories": [
            {"id": "motor_gross", "label": "Motor Amplo", "icon": "Footprints", "color": "text-teal-500", "bgColor": "bg-baby-mint/30"},
            {"id": "motor_fine", "label": "Motor Fino", "icon": "Hand", "color": "text-emerald-500", "bgColor": "bg-baby-mint/20"},
            {"id": "language", "label": "Linguagem", "icon": "MessageCircle", "color": "text-blue-500", "bgColor": "bg-baby-blue/30"},
            {"id": "cognitive", "label": "Cognitivo", "icon": "Brain", "color": "text-violet-500", "bgColor": "bg-baby-lavender/30"},
            {"id": "social", "label": "Social-Emocional", "icon": "Heart", "color": "text-pink-500", "bgColor": "bg-baby-pink/30"},
            {"id": "sensory", "label": "Sensorial", "icon": "Eye", "color": "text-amber-500", "bgColor": "bg-baby-peach/30"},
        ],
        "milestoneStatusConfig": {
            "observed": {"label": "Observado", "color": "text-primary", "bgColor": "bg-primary/10"},
            "emerging": {"label": "Comecando", "color": "text-amber-600", "bgColor": "bg-baby-yellow/50"},
            "not_yet": {"label": "Ainda nao", "color": "text-muted-foreground", "bgColor": "bg-secondary"},
        },
        "healthEventTypes": [
            {"id": "fever", "label": "Febre", "icon": "Thermometer", "color": "text-red-400", "bgColor": "bg-red-100"},
            {"id": "cold", "label": "Resfriado", "icon": "Bug", "color": "text-blue-400", "bgColor": "bg-baby-blue/30"},
            {"id": "allergy", "label": "Alergia", "icon": "AlertCircle", "color": "text-amber-500", "bgColor": "bg-baby-yellow/30"},
            {"id": "malaise", "label": "Mal-estar", "icon": "Heart", "color": "text-rose-400", "bgColor": "bg-baby-pink/30"},
            {"id": "consultation", "label": "Consulta", "icon": "Stethoscope", "color": "text-primary", "bgColor": "bg-baby-mint/30"},
            {"id": "other", "label": "Outro", "icon": "Activity", "color": "text-muted-foreground", "bgColor": "bg-secondary"},
        ],
        "metricConfig": {
            "weight": {"label": "Peso", "unit": "kg", "icon": "Weight", "color": "bg-baby-peach/40", "chartColor": "#f4a261"},
            "height": {"label": "Altura", "unit": "cm", "icon": "Ruler", "color": "bg-baby-blue/40", "chartColor": "#64b5f6"},
            "head": {"label": "Cabeça", "unit": "cm", "icon": "CircleDot", "color": "bg-baby-lavender/40", "chartColor": "#ce93d8"},
        },
        "growthTimeFilters": ["3m", "6m", "1a", "Tudo"],
    }
    dump("catalogs", catalogs)

    content_shell = {
        "tabs": [
            {"path": "/", "label": "Hoje", "icon": "Heart"},
            {"path": "/caregivers", "label": "Cuidadores", "icon": "Users"},
            {"path": "/routines", "label": "Rotinas", "icon": "BookOpen"},
            {"path": "/my-baby", "label": "Meu Bebê", "icon": "Baby"},
        ],
        "routinesFeatured": {
            "tag": "Destaque",
            "title": "Rotina do sono para 8 meses",
            "description": "Aprenda a criar uma rotina noturna calma e consistente para seu bebê.",
            "ctaLabel": "Começar",
        },
        "routines": [
            {"id": "tummy", "title": "Tempo de Bruços", "subtitle": "Fortalece pescoço e ombros", "duration": "5-15 min", "color": "from-baby-mint/30 to-baby-blue/20", "icon": "Sun"},
            {"id": "reading", "title": "Hora da Leitura", "subtitle": "Estimula linguagem e vínculo", "duration": "10-20 min", "color": "from-baby-lavender/30 to-baby-pink/20", "icon": "BookOpen"},
            {"id": "sleep-routine", "title": "Rotina do Sono", "subtitle": "Banho, livro, música, sono", "duration": "30 min", "color": "from-baby-blue/30 to-baby-lavender/20", "icon": "Moon"},
            {"id": "play", "title": "Brincadeira Livre", "subtitle": "Exploração e desenvolvimento motor", "duration": "15-30 min", "color": "from-baby-peach/30 to-baby-yellow/20", "icon": "Play"},
            {"id": "feeding-guide", "title": "Guia de Alimentação", "subtitle": "Introdução alimentar por idade", "duration": "Consulta", "color": "from-baby-peach/40 to-baby-mint/20", "icon": "Apple"},
            {"id": "music", "title": "Música e Cantigas", "subtitle": "Estímulo auditivo e calma", "duration": "10 min", "color": "from-baby-pink/30 to-baby-lavender/20", "icon": "Music"},
        ],
        "articles": [
            {"title": "Como criar uma rotina de sono saudável", "tag": "Sono", "mins": 5},
            {"title": "Introdução alimentar: guia completo", "tag": "Alimentação", "mins": 8},
            {"title": "Atividades para desenvolvimento motor", "tag": "Atividades", "mins": 4},
        ],
    }
    dump("content_shell", content_shell)

    foods = [
        {"id": "1", "name": "Sopa de abóbora", "calories": 45, "protein": 1.2, "carbs": 8.5, "fat": 0.8, "fiber": 2.1},
        {"id": "2", "name": "Papinha de maçã", "calories": 52, "protein": 0.3, "carbs": 14.0, "fat": 0.2, "fiber": 1.3},
        {"id": "3", "name": "Purê de batata doce", "calories": 76, "protein": 1.4, "carbs": 17.0, "fat": 0.1, "fiber": 2.5},
        {"id": "4", "name": "Banana amassada", "calories": 89, "protein": 1.1, "carbs": 22.8, "fat": 0.3, "fiber": 2.6},
        {"id": "5", "name": "Papinha de frango com legumes", "calories": 68, "protein": 5.2, "carbs": 6.8, "fat": 2.1, "fiber": 1.0},
        {"id": "6", "name": "Mingau de aveia", "calories": 71, "protein": 2.5, "carbs": 12.0, "fat": 1.5, "fiber": 1.7},
        {"id": "7", "name": "Sopa de cenoura", "calories": 38, "protein": 0.9, "carbs": 8.2, "fat": 0.2, "fiber": 2.8},
        {"id": "8", "name": "Papinha de pera", "calories": 47, "protein": 0.4, "carbs": 12.0, "fat": 0.1, "fiber": 2.4},
        {"id": "9", "name": "Arroz com feijão amassado", "calories": 120, "protein": 4.5, "carbs": 22.0, "fat": 1.0, "fiber": 3.2},
        {"id": "10", "name": "Iogurte natural", "calories": 61, "protein": 3.5, "carbs": 4.7, "fat": 3.3, "fiber": 0},
    ]
    dump("food_catalog", {"foods": foods})

    percentile_bands = {
        "weight": [
            {"month": 0, "p3": 2.5, "p15": 2.9, "p50": 3.3, "p85": 3.7, "p97": 4.2},
            {"month": 1, "p3": 3.4, "p15": 3.9, "p50": 4.5, "p85": 5.0, "p97": 5.5},
            {"month": 2, "p3": 4.3, "p15": 4.9, "p50": 5.6, "p85": 6.3, "p97": 6.9},
            {"month": 3, "p3": 5.0, "p15": 5.7, "p50": 6.4, "p85": 7.1, "p97": 7.8},
            {"month": 4, "p3": 5.6, "p15": 6.3, "p50": 7.0, "p85": 7.7, "p97": 8.4},
            {"month": 5, "p3": 6.0, "p15": 6.7, "p50": 7.5, "p85": 8.3, "p97": 9.0},
            {"month": 6, "p3": 6.4, "p15": 7.1, "p50": 7.9, "p85": 8.7, "p97": 9.5},
            {"month": 7, "p3": 6.7, "p15": 7.4, "p50": 8.3, "p85": 9.1, "p97": 9.9},
            {"month": 8, "p3": 7.0, "p15": 7.7, "p50": 8.6, "p85": 9.4, "p97": 10.3},
            {"month": 9, "p3": 7.2, "p15": 8.0, "p50": 8.9, "p85": 9.7, "p97": 10.6},
            {"month": 10, "p3": 7.4, "p15": 8.2, "p50": 9.1, "p85": 10.0, "p97": 10.9},
            {"month": 11, "p3": 7.6, "p15": 8.4, "p50": 9.4, "p85": 10.3, "p97": 11.2},
            {"month": 12, "p3": 7.8, "p15": 8.6, "p50": 9.6, "p85": 10.5, "p97": 11.5},
        ],
        "height": [
            {"month": 0, "p3": 46.1, "p15": 47.5, "p50": 49.9, "p85": 52.0, "p97": 53.7},
            {"month": 1, "p3": 50.8, "p15": 52.2, "p50": 54.7, "p85": 57.0, "p97": 58.6},
            {"month": 2, "p3": 54.4, "p15": 55.9, "p50": 58.4, "p85": 60.8, "p97": 62.4},
            {"month": 3, "p3": 57.3, "p15": 58.8, "p50": 61.4, "p85": 63.9, "p97": 65.5},
            {"month": 4, "p3": 59.7, "p15": 61.2, "p50": 63.9, "p85": 66.4, "p97": 68.0},
            {"month": 5, "p3": 61.7, "p15": 63.2, "p50": 65.9, "p85": 68.5, "p97": 70.1},
            {"month": 6, "p3": 63.3, "p15": 64.9, "p50": 67.6, "p85": 70.3, "p97": 71.9},
            {"month": 7, "p3": 64.8, "p15": 66.4, "p50": 69.2, "p85": 71.9, "p97": 73.5},
            {"month": 8, "p3": 66.2, "p15": 67.8, "p50": 70.6, "p85": 73.3, "p97": 75.0},
            {"month": 9, "p3": 67.5, "p15": 69.1, "p50": 72.0, "p85": 74.7, "p97": 76.5},
            {"month": 10, "p3": 68.7, "p15": 70.4, "p50": 73.3, "p85": 76.1, "p97": 77.9},
            {"month": 11, "p3": 69.9, "p15": 71.6, "p50": 74.5, "p85": 77.3, "p97": 79.2},
            {"month": 12, "p3": 71.0, "p15": 72.8, "p50": 75.7, "p85": 78.6, "p97": 80.5},
        ],
        "head": [
            {"month": 0, "p3": 32.1, "p15": 33.0, "p50": 34.5, "p85": 35.7, "p97": 36.7},
            {"month": 1, "p3": 34.9, "p15": 35.8, "p50": 37.3, "p85": 38.5, "p97": 39.5},
            {"month": 2, "p3": 36.8, "p15": 37.7, "p50": 39.1, "p85": 40.3, "p97": 41.3},
            {"month": 3, "p3": 38.1, "p15": 39.0, "p50": 40.5, "p85": 41.7, "p97": 42.7},
            {"month": 4, "p3": 39.2, "p15": 40.1, "p50": 41.6, "p85": 42.8, "p97": 43.8},
            {"month": 5, "p3": 40.1, "p15": 41.0, "p50": 42.6, "p85": 43.8, "p97": 44.8},
            {"month": 6, "p3": 40.9, "p15": 41.8, "p50": 43.3, "p85": 44.6, "p97": 45.6},
            {"month": 7, "p3": 41.5, "p15": 42.4, "p50": 44.0, "p85": 45.3, "p97": 46.3},
            {"month": 8, "p3": 42.0, "p15": 43.0, "p50": 44.5, "p85": 45.8, "p97": 46.9},
            {"month": 9, "p3": 42.5, "p15": 43.4, "p50": 45.0, "p85": 46.3, "p97": 47.4},
            {"month": 10, "p3": 42.9, "p15": 43.8, "p50": 45.4, "p85": 46.7, "p97": 47.8},
            {"month": 11, "p3": 43.2, "p15": 44.2, "p50": 45.8, "p85": 47.1, "p97": 48.2},
            {"month": 12, "p3": 43.5, "p15": 44.5, "p50": 46.1, "p85": 47.4, "p97": 48.5},
        ],
    }
    growth = {
        "percentileBands": percentile_bands,
        "initialEntries": [
            {"id": "1", "date": "2025-08-05", "weight": 3.3, "height": 50, "head": 34.5},
            {"id": "2", "date": "2025-09-10", "weight": 4.5, "height": 54, "head": 37},
            {"id": "3", "date": "2025-10-15", "weight": 5.6, "height": 58, "head": 39},
            {"id": "4", "date": "2025-11-12", "weight": 6.4, "height": 61, "head": 40.5},
            {"id": "5", "date": "2025-12-10", "weight": 7.0, "height": 64, "head": 41.5},
            {"id": "6", "date": "2026-01-08", "weight": 7.5, "height": 66, "head": 42.5},
            {"id": "7", "date": "2026-02-05", "weight": 7.9, "height": 68, "head": 43.5},
            {"id": "8", "date": "2026-03-10", "weight": 8.2, "height": 70, "head": 44},
        ],
        "timeFilters": ["3m", "6m", "1a", "Tudo"],
    }
    dump("growth", growth)

    dump(
        "default_baby",
        {
            "id": "seed-liam-1",
            "name": "Liam",
            "birth_date": "2025-08-05",
            "photo_url": None,
        },
    )

    baby_profile_extras = {
        "defaultBabyId": "seed-liam-1",
        "bloodType": "O+",
        "growthCards": [
            {"label": "Peso", "value": "8.2", "unit": "kg", "percentile": 55, "icon": "Weight", "color": "bg-baby-peach/40"},
            {"label": "Altura", "value": "70", "unit": "cm", "percentile": 62, "icon": "Ruler", "color": "bg-baby-blue/40"},
            {"label": "Cabeça", "value": "44", "unit": "cm", "percentile": 48, "icon": "CircleDot", "color": "bg-baby-lavender/40"},
        ],
        "recentMilestones": [
            {"title": "Senta sem apoio", "observedAge": "6 meses", "done": True},
            {"title": "Engatinha", "observedAge": "7 meses", "done": True},
            {"title": "Puxa para ficar de pé", "observedAge": None, "done": False},
        ],
        "healthSummary": {
            "vaccines": {"total": 12, "upToDate": True},
            "vitamins": {"active": 2, "names": ["Vit. D", "Ferro"]},
            "events": {"recent": 1, "lastEvent": "Resfriado leve"},
        },
    }
    dump("baby_profile_extras", baby_profile_extras)

    baby_core = {
        "pillars": [
            {"label": "Alimentação", "shortLabel": "Alim.", "score": 86, "color": "#FFDAB9", "status": "No caminho", "trend": "up", "detail": "4 refeições registradas — padrão consistente com a idade."},
            {"label": "Sono", "shortLabel": "Sono", "score": 78, "color": "#E8D5F0", "status": "Bom", "trend": "stable", "detail": "2h40 de sono diurno — janela de despertar saudável."},
            {"label": "Hidratação", "shortLabel": "Hidr.", "score": 92, "color": "#A8D8EA", "status": "Normal", "trend": "up", "detail": "3 fraldas molhadas, 1 suja — eliminação adequada."},
            {"label": "Desenvolvimento", "shortLabel": "Desenv.", "score": 70, "color": "#7EC8B8", "status": "Um pouco baixo", "trend": "down", "detail": "1 sessão de atividade — considere mais tempo de barriga."},
        ]
    }
    dump("baby_core", baby_core)

    today = {
        "insights": [
            "O cochilo da manhã costuma ser entre 8h e 9h.",
            "Hidratação tende a cair à tarde — lembre-se de oferecer água!",
            "A ingestão de leite está mais forte pela manhã.",
        ],
        "quickActivities": [
            {"id": "tummy", "label": "Bruços", "icon": "Baby"},
            {"id": "reading", "label": "Leitura", "icon": "BookOpen"},
            {"id": "play", "label": "Brincar", "icon": "Footprints"},
            {"id": "visual", "label": "Estímulo", "icon": "Eye"},
        ],
        "quickVitamins": [{"id": "vitd", "label": "Vit. D"}, {"id": "iron", "label": "Ferro"}],
        "quickMeds": [{"id": "paracetamol", "label": "Paracet."}, {"id": "dipirona", "label": "Dipirona"}],
        "vitaminItems": [
            {"id": "vitd", "label": "Vit. D", "takenAt": "08:00"},
            {"id": "iron", "label": "Ferro", "takenAt": None},
        ],
        "medItems": [
            {"id": "paracetamol", "label": "Paracetamol", "takenAt": None},
            {"id": "dipirona", "label": "Dipirona", "takenAt": None},
        ],
        "initialWaterMl": 180,
        "hydrationGoalMl": 500,
        "lastWakeOffsetMs": 5400000,
    }
    dump("today", today)

    timeline_seed = [
        {"type": "feeding", "subType": "breast", "time": "07:15", "caregiver": "Mamãe", "notes": "Amamentou bem"},
        {"type": "diaper", "subType": "wet", "time": "07:45", "caregiver": "Papai"},
        {"type": "sleep", "subType": "", "time": "08:30", "caregiver": "Mamãe", "notes": "Cochilo de 40min"},
        {"type": "feeding", "subType": "solids", "time": "10:00", "caregiver": "Vovó", "notes": "Banana e aveia"},
        {"type": "hydration", "subType": "", "time": "10:30", "caregiver": "Vovó", "quantity": 60},
        {"type": "activity", "subType": "tummy", "time": "11:00", "caregiver": "Papai", "notes": "15 min"},
        {"type": "diaper", "subType": "dirty", "time": "11:30", "caregiver": "Papai"},
    ]
    dump("timeline_seed", {"entries": timeline_seed})

    milestones = {
        "ageWindows": ["0-3 meses", "4-6 meses", "6-9 meses", "9-12 meses"],
        "initialMilestones": [
            {"id": "m1", "title": "Sustenta a cabeca brevemente", "description": "Quando de brucos, levanta a cabeca por alguns segundos", "ageRange": "0-3 meses", "category": "motor_gross", "status": "observed", "observedDate": "2025-10-15"},
            {"id": "m2", "title": "Sorri em resposta", "description": "Responde com sorriso quando voce sorri", "ageRange": "0-3 meses", "category": "social", "status": "observed", "observedDate": "2025-10-20"},
            {"id": "m3", "title": "Segue objetos com os olhos", "description": "Acompanha um brinquedo colorido movendo devagar", "ageRange": "0-3 meses", "category": "sensory", "status": "observed", "observedDate": "2025-09-25"},
            {"id": "m4", "title": "Produz sons (gugu, agu)", "description": "Emite sons de vogais em resposta a vozes", "ageRange": "0-3 meses", "category": "language", "status": "observed", "observedDate": "2025-11-01"},
            {"id": "m5", "title": "Rola de barriga para cima", "description": "Consegue virar de brucos para de costas", "ageRange": "4-6 meses", "category": "motor_gross", "status": "observed", "observedDate": "2025-12-20"},
            {"id": "m6", "title": "Agarra objetos com as duas maos", "description": "Pega brinquedos e leva a boca", "ageRange": "4-6 meses", "category": "motor_fine", "status": "observed", "observedDate": "2025-12-10"},
            {"id": "m7", "title": "Senta com apoio", "description": "Fica sentado quando apoiado em almofadas", "ageRange": "4-6 meses", "category": "motor_gross", "status": "observed", "observedDate": "2026-01-05"},
            {"id": "m8", "title": "Reconhece rostos familiares", "description": "Reage de forma diferente a pessoas conhecidas", "ageRange": "4-6 meses", "category": "social", "status": "observed", "observedDate": "2025-12-15"},
            {"id": "m9", "title": "Senta sem apoio", "description": "Consegue sentar sozinho de forma estavel", "ageRange": "6-9 meses", "category": "motor_gross", "status": "observed", "observedDate": "2026-02-10"},
            {"id": "m10", "title": "Engatinha", "description": "Se movimenta engatinhando para explorar", "ageRange": "6-9 meses", "category": "motor_gross", "status": "observed", "observedDate": "2026-03-01"},
            {"id": "m11", "title": "Puxa para ficar de pe", "description": "Se segura em moveis para ficar em pe", "ageRange": "6-9 meses", "category": "motor_gross", "status": "emerging", "notes": "Tentando bastante nos ultimos dias"},
            {"id": "m12", "title": "Transfere objetos entre maos", "description": "Passa um brinquedo de uma mao para outra", "ageRange": "6-9 meses", "category": "motor_fine", "status": "observed", "observedDate": "2026-02-20"},
            {"id": "m13", "title": "Balbucia silabas (ba-ba, ma-ma)", "description": "Produz sequencias de silabas repetidas", "ageRange": "6-9 meses", "category": "language", "status": "emerging"},
            {"id": "m14", "title": "Brinca de cade-achou", "description": "Se diverte quando voce esconde e revela o rosto", "ageRange": "6-9 meses", "category": "cognitive", "status": "observed", "observedDate": "2026-02-15"},
            {"id": "m15", "title": "Primeiras palavras", "description": "Diz 'mama' ou 'papa' com intencao", "ageRange": "9-12 meses", "category": "language", "status": "not_yet"},
            {"id": "m16", "title": "Aponta para objetos", "description": "Usa o indicador para mostrar o que quer", "ageRange": "9-12 meses", "category": "language", "status": "not_yet"},
            {"id": "m17", "title": "Fica de pe sem apoio", "description": "Consegue ficar em pe sozinho por alguns segundos", "ageRange": "9-12 meses", "category": "motor_gross", "status": "not_yet"},
            {"id": "m18", "title": "Pinça fina", "description": "Pega objetos pequenos entre o polegar e indicador", "ageRange": "9-12 meses", "category": "motor_fine", "status": "not_yet"},
        ],
    }
    dump("milestones", milestones)

    vaccines = [
        {"id": "1", "name": "BCG", "date": "2025-08-06", "manufacturer": "Fundacao Ataulpho de Paiva", "location": "Maternidade", "hadReaction": False, "reactionDetails": "", "notes": "Aplicada no braco direito", "dose": "Dose unica"},
        {"id": "2", "name": "Hepatite B", "date": "2025-08-06", "manufacturer": "Butantan", "location": "Maternidade", "hadReaction": False, "reactionDetails": "", "notes": "", "dose": "1a dose"},
        {"id": "3", "name": "Pentavalente (DTP+Hib+HB)", "date": "2025-10-05", "manufacturer": "Serum Institute", "location": "UBS Centro", "hadReaction": True, "reactionDetails": "Febre baixa por 24h, irritabilidade", "notes": "", "dose": "1a dose"},
        {"id": "4", "name": "VIP (Polio inativada)", "date": "2025-10-05", "manufacturer": "Sanofi", "location": "UBS Centro", "hadReaction": False, "reactionDetails": "", "notes": "", "dose": "1a dose"},
        {"id": "5", "name": "Pneumococica 10V", "date": "2025-10-05", "manufacturer": "GSK", "location": "UBS Centro", "hadReaction": False, "reactionDetails": "", "notes": "", "dose": "1a dose"},
        {"id": "6", "name": "Rotavirus", "date": "2025-10-05", "manufacturer": "GSK", "location": "UBS Centro", "hadReaction": False, "reactionDetails": "", "notes": "Via oral", "dose": "1a dose"},
        {"id": "7", "name": "Pentavalente (DTP+Hib+HB)", "date": "2025-12-05", "manufacturer": "Serum Institute", "location": "UBS Centro", "hadReaction": False, "reactionDetails": "", "notes": "", "dose": "2a dose"},
        {"id": "8", "name": "VIP (Polio inativada)", "date": "2025-12-05", "manufacturer": "Sanofi", "location": "UBS Centro", "hadReaction": False, "reactionDetails": "", "notes": "", "dose": "2a dose"},
        {"id": "9", "name": "Pneumococica 10V", "date": "2025-12-05", "manufacturer": "GSK", "location": "UBS Centro", "hadReaction": False, "reactionDetails": "", "notes": "", "dose": "2a dose"},
        {"id": "10", "name": "Rotavirus", "date": "2025-12-05", "manufacturer": "GSK", "location": "UBS Centro", "hadReaction": False, "reactionDetails": "", "notes": "", "dose": "2a dose"},
        {"id": "11", "name": "Meningococica C", "date": "2026-01-05", "manufacturer": "GSK", "location": "UBS Centro", "hadReaction": False, "reactionDetails": "", "notes": "", "dose": "1a dose"},
        {"id": "12", "name": "Febre Amarela", "date": "2026-03-05", "manufacturer": "Bio-Manguinhos", "location": "UBS Centro", "hadReaction": False, "reactionDetails": "", "notes": "", "dose": "Dose unica"},
    ]
    dump("vaccines", {"vaccines": vaccines})

    vitamins = [
        {
            "id": "1",
            "name": "Vitamina D",
            "dose": "400",
            "unit": "UI",
            "frequency": "1x ao dia",
            "startDate": "2025-08-10",
            "endDate": None,
            "active": True,
            "notes": "Orientacao do pediatra desde o nascimento",
            "history": [
                {"date": "2025-08-10", "dose": "400 UI", "notes": "Inicio"},
                {"date": "2025-12-15", "dose": "400 UI", "notes": "Pediatra confirmou manter dose"},
            ],
        },
        {
            "id": "2",
            "name": "Ferro (Sulfato Ferroso)",
            "dose": "1",
            "unit": "mg/kg",
            "frequency": "1x ao dia",
            "startDate": "2026-02-05",
            "endDate": None,
            "active": True,
            "notes": "Iniciado aos 6 meses. Dar longe das refeicoes de leite.",
            "history": [
                {"date": "2026-02-05", "dose": "1 mg/kg (8 gotas)", "notes": "Inicio - peso 7.9 kg"},
                {"date": "2026-03-10", "dose": "1 mg/kg (8.5 gotas)", "notes": "Ajuste - peso 8.2 kg"},
            ],
        },
        {
            "id": "3",
            "name": "Polivitaminico",
            "dose": "15",
            "unit": "gotas",
            "frequency": "1x ao dia",
            "startDate": "2025-10-01",
            "endDate": "2026-01-15",
            "active": False,
            "notes": "Usado por 3 meses conforme orientacao",
            "history": [
                {"date": "2025-10-01", "dose": "15 gotas", "notes": "Inicio"},
                {"date": "2026-01-15", "dose": "15 gotas", "notes": "Encerrado"},
            ],
        },
    ]
    dump("vitamins", {"vitamins": vitamins})

    health_events = {
        "events": [
            {"id": "1", "type": "consultation", "date": "2026-03-10", "endDate": None, "description": "Consulta de rotina - 7 meses", "notes": "Peso 8.2kg, altura 70cm. Pediatra satisfeito com desenvolvimento. Manter Vit D e Ferro."},
            {"id": "2", "type": "cold", "date": "2026-02-20", "endDate": "2026-02-25", "description": "Resfriado leve", "notes": "Nariz escorrendo por 5 dias. Sem febre. Usado soro fisiologico nasal."},
            {"id": "3", "type": "fever", "date": "2025-12-06", "endDate": "2025-12-07", "description": "Febre pos-vacina", "notes": "38.2C apos Pentavalente 2a dose. Cedeu com Paracetamol. Durou 24h."},
        ]
    }
    dump("health_events", health_events)

    health_detail = {
        "vitamins": [
            {"name": "Vitamina D", "dosage": "5 gotas", "time": "08:00", "frequency": "Diário", "purpose": "Fortalecimento ósseo"},
            {"name": "Ferro", "dosage": "1 ml", "time": "10:00", "frequency": "Diário", "purpose": "Prevenção de anemia"},
        ],
        "medications": [
            {"name": "Paracetamol", "dosage": "2.5 ml", "time": "14:00", "reason": "Febre", "status": "Uso eventual"},
        ],
        "history": [
            {
                "date": "Hoje",
                "items": [
                    {"type": "vitamin", "name": "Vitamina D", "dosage": "5 gotas", "time": "08:00"},
                    {"type": "vitamin", "name": "Ferro", "dosage": "1 ml", "time": "10:00"},
                ],
            },
            {
                "date": "Ontem",
                "items": [
                    {"type": "vitamin", "name": "Vitamina D", "dosage": "5 gotas", "time": "08:15"},
                    {"type": "vitamin", "name": "Ferro", "dosage": "1 ml", "time": "10:30"},
                    {"type": "medication", "name": "Paracetamol", "dosage": "2.5 ml", "time": "20:00"},
                ],
            },
            {
                "date": "3 Abr",
                "items": [
                    {"type": "vitamin", "name": "Vitamina D", "dosage": "5 gotas", "time": "08:00"},
                    {"type": "vitamin", "name": "Ferro", "dosage": "1 ml", "time": "09:45"},
                ],
            },
        ],
    }
    dump("health_detail", health_detail)

    caregivers_feed = {
        "caregivers": [
            {"id": "all", "name": "Todos", "emoji": "👥"},
            {"id": "mom", "name": "Mamãe", "emoji": "👩"},
            {"id": "dad", "name": "Papai", "emoji": "👨"},
            {"id": "grandma", "name": "Vovó", "emoji": "👵"},
            {"id": "nanny", "name": "Babá", "emoji": "🧑‍🍼"},
        ],
        "sharedFeed": [
            {"type": "feeding", "subType": "breast", "time": "07:15", "caregiver": "Mamãe", "notes": "Amamentou bem"},
            {"type": "diaper", "subType": "wet", "time": "07:45", "caregiver": "Papai"},
            {"type": "sleep", "time": "08:30", "caregiver": "Mamãe", "notes": "Cochilo de 40min"},
            {"type": "feeding", "subType": "solids", "time": "10:00", "caregiver": "Vovó", "notes": "Banana e aveia"},
            {"type": "hydration", "time": "10:30", "caregiver": "Vovó"},
            {"type": "activity", "subType": "tummy", "time": "11:00", "caregiver": "Papai"},
            {"type": "feeding", "subType": "bottle", "time": "13:00", "caregiver": "Babá", "notes": "150ml fórmula"},
            {"type": "sleep", "time": "13:30", "caregiver": "Babá", "notes": "Cochilo da tarde"},
        ],
    }
    dump("caregivers_feed", caregivers_feed)

    food_by_id = {f["id"]: f for f in foods}
    initial_feedings = [
        {"id": "1", "time": "07:15", "type": "breast", "typeLabel": "Amamentação", "side": "Esquerdo", "duration": "12 min"},
        {"id": "2", "time": "10:00", "type": "solids", "typeLabel": "Sólidos", "notes": "Banana e aveia", "amount": "~80g", "food": food_by_id["4"]},
        {"id": "3", "time": "12:30", "type": "bottle", "typeLabel": "Mamadeira", "amount": "150 ml", "notes": "Leite materno"},
        {"id": "4", "time": "13:30", "type": "formula", "typeLabel": "Fórmula", "amount": "180 ml", "formulaBrand": "NAN 1"},
        {"id": "5", "time": "15:00", "type": "breast", "typeLabel": "Amamentação", "side": "Direito", "duration": "10 min"},
    ]
    week_summary_feeding = [
        {"day": "Seg", "count": 6},
        {"day": "Ter", "count": 5},
        {"day": "Qua", "count": 7},
        {"day": "Qui", "count": 5},
        {"day": "Sex", "count": 6},
        {"day": "Sáb", "count": 4},
        {"day": "Dom", "count": 5},
    ]

    tracker_logs = {
        "feeding": {"initialFeedings": initial_feedings, "weekSummary": week_summary_feeding},
        "sleep": {
            "initialLogs": [
                {"id": "1", "type": "night", "typeLabel": "Noturno", "start": "22:00", "end": "06:30", "location": "Berço", "notes": ""},
                {"id": "2", "type": "nap", "typeLabel": "Cochilo", "start": "08:30", "end": "09:10", "location": "Colo", "notes": ""},
                {"id": "3", "type": "nap", "typeLabel": "Cochilo", "start": "13:00", "end": "14:30", "location": "Berço", "notes": "Dormiu após almoço"},
            ],
            "weekData": [
                {"day": "Seg", "hours": 13.5},
                {"day": "Ter", "hours": 12.0},
                {"day": "Qua", "hours": 14.0},
                {"day": "Qui", "hours": 13.0},
                {"day": "Sex", "hours": 11.5},
                {"day": "Sáb", "hours": 13.5},
                {"day": "Dom", "hours": 10.7},
            ],
        },
        "hydration": {
            "initialLogs": [
                {"id": "1", "time": "08:00", "amount": 60, "type": "water", "typeLabel": "Água", "notes": "Após amamentar"},
                {"id": "2", "time": "10:30", "amount": 80, "type": "juice", "typeLabel": "Suco", "notes": "Suco de maçã"},
                {"id": "3", "time": "13:00", "amount": 60, "type": "water", "typeLabel": "Água", "notes": "Com almoço"},
                {"id": "4", "time": "15:30", "amount": 50, "type": "tea", "typeLabel": "Chá", "notes": "Chá de camomila"},
            ],
            "weekData": [
                {"day": "Seg", "ml": 240},
                {"day": "Ter", "ml": 300},
                {"day": "Qua", "ml": 180},
                {"day": "Qui", "ml": 210},
                {"day": "Sex", "ml": 270},
                {"day": "Sáb", "ml": 180},
                {"day": "Dom", "ml": 250},
            ],
        },
        "diaper": {
            "initialLogs": [
                {"id": "1", "time": "07:45", "type": "pee", "typeLabel": "Xixi", "peeVolume": 2, "pooVolume": 1, "notes": ""},
                {"id": "2", "time": "10:15", "type": "poo", "typeLabel": "Cocô", "peeVolume": 1, "pooVolume": 3, "notes": "Consistência normal"},
                {"id": "3", "time": "11:30", "type": "mixed", "typeLabel": "Misto", "peeVolume": 2, "pooVolume": 2, "notes": ""},
                {"id": "4", "time": "14:00", "type": "pee", "typeLabel": "Xixi", "peeVolume": 3, "pooVolume": 1, "notes": ""},
                {"id": "5", "time": "16:45", "type": "pee", "typeLabel": "Xixi", "peeVolume": 1, "pooVolume": 1, "notes": "Antes do banho"},
            ],
            "weekData": [
                {"day": "Seg", "wet": 5, "dirty": 2},
                {"day": "Ter", "wet": 6, "dirty": 1},
                {"day": "Qua", "wet": 4, "dirty": 2},
                {"day": "Qui", "wet": 5, "dirty": 1},
                {"day": "Sex", "wet": 5, "dirty": 2},
                {"day": "Sáb", "wet": 3, "dirty": 1},
                {"day": "Dom", "wet": 3, "dirty": 0},
            ],
        },
        "bath": {
            "initialLogs": [
                {"id": "1", "time": "18:30", "temp": "morno", "tempLabel": "Morno", "duration": 15, "notes": "Banho relaxante antes de dormir"},
            ],
            "weekData": [
                {"day": "Seg", "count": 1},
                {"day": "Ter", "count": 1},
                {"day": "Qua", "count": 2},
                {"day": "Qui", "count": 1},
                {"day": "Sex", "count": 1},
                {"day": "Sáb", "count": 1},
                {"day": "Dom", "count": 1},
            ],
        },
        "activity": {
            "initialLogs": [
                {"id": "1", "time": "09:30", "type": "tummy", "label": "Bruços", "duration": 15, "notes": ""},
                {"id": "2", "time": "11:00", "type": "reading", "label": "Leitura", "duration": 10, "notes": "2 livros"},
                {"id": "3", "time": "14:30", "type": "play", "label": "Brincar", "duration": 20, "notes": ""},
            ],
            "weekData": [
                {"day": "Seg", "min": 45},
                {"day": "Ter", "min": 60},
                {"day": "Qua", "min": 30},
                {"day": "Qui", "min": 50},
                {"day": "Sex", "min": 40},
                {"day": "Sáb", "min": 25},
                {"day": "Dom", "min": 45},
            ],
        },
    }
    dump("tracker_logs", tracker_logs)

    tracker_charts = {
        "feeding": week_summary_feeding,
        "sleep": tracker_logs["sleep"]["weekData"],
        "hydration": tracker_logs["hydration"]["weekData"],
        "diaper": tracker_logs["diaper"]["weekData"],
        "bath": tracker_logs["bath"]["weekData"],
        "activity": tracker_logs["activity"]["weekData"],
    }
    # activity_v2 week from generate_activity_v2_seed
    av2_path = SEED / "activity_v2.json"
    if av2_path.exists():
        av2 = json.loads(av2_path.read_text(encoding="utf-8"))
        tracker_charts["activity_v2"] = av2.get("weekData", [])
    dump("tracker_charts", tracker_charts)


if __name__ == "__main__":
    main()
