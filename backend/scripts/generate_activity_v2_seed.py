#!/usr/bin/env python3
"""Generate activity_v2.json seed from structured tuples (icon = lucide name)."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent / "ui_app_defaults"

# (cat_id, label, color, bgColor, cat_icon, [(act_id, label, act_icon, desc?), ...])
DATA = [
    (
        "attachment",
        "Vínculo & Afeto",
        "text-pink-500",
        "bg-baby-pink/30",
        "Heart",
        [
            ("skin_contact", "Pele a pele", "Heart", "Contato pele a pele"),
            ("gentle_touch", "Toque suave", "Hand", "Massagem e carinho"),
            ("held_feeding", "Colo durante mamada", "Baby", "Olhar e conversar durante alimentação"),
            ("turn_taking", "Troca de turnos", "Smile", "Imitar sons e gestos do bebê"),
            ("calming", "Acalmar juntos", "Sparkles", "Estratégias de autorregulação"),
        ],
    ),
    (
        "language",
        "Linguagem & Comunicação",
        "text-blue-500",
        "bg-baby-blue/30",
        "MessageCircle",
        [
            ("face_talk", "Conversa face a face", "MessageCircle", "Falar no nível dos olhos"),
            ("narrate", "Narrar ações", "MessageCircle", "Descrever o que está fazendo"),
            ("sound_imitation", "Imitar sons", "Ear", "Copiar e expandir sons do bebê"),
            ("name_objects", "Nomear objetos", "Eye", "Apontar e nomear o que o bebê olha"),
            ("songs_rhymes", "Canções e rimas", "Music", "Cantar com gestos"),
            ("simple_directions", "Instruções simples", "MessageCircle", "Pedidos de 2-3 passos"),
        ],
    ),
    (
        "literacy",
        "Livros & Leitura",
        "text-indigo-500",
        "bg-baby-lavender/30",
        "BookOpen",
        [
            ("picture_book", "Livro de figuras", "BookOpen", "Olhar fotos coloridas juntos"),
            ("point_label", "Apontar e nomear", "Eye", "Identificar figuras no livro"),
            ("story_questions", "Perguntas da história", "Brain", "O que acontece depois?"),
            ("bedtime_reading", "Leitura antes de dormir", "BookOpen", "Rotina calma com 1-2 livros"),
        ],
    ),
    (
        "sensory",
        "Exploração Sensorial",
        "text-amber-500",
        "bg-baby-peach/30",
        "Sparkles",
        [
            ("visual_tracking", "Rastrear visual", "Eye", "Mover objeto colorido lentamente"),
            ("texture_touch", "Texturas variadas", "Hand", "Explorar tecidos, objetos diferentes"),
            ("sound_making", "Fazer sons", "Music", "Chocalho, tambor, colher na panela"),
            ("safe_mouthing", "Exploração oral", "Baby", "Objetos seguros para levar à boca"),
            ("food_textures", "Texturas alimentares", "Sparkles", "Variedade de texturas na alimentação"),
            ("sensory_outdoor", "Sensorial ao ar livre", "Leaf", "Plantas, terra, água"),
        ],
    ),
    (
        "fine_motor",
        "Motricidade Fina & Mão-Olho",
        "text-emerald-500",
        "bg-baby-mint/30",
        "Hand",
        [
            ("grasp_release", "Pegar e soltar", "Hand", "Agarrar e largar brinquedos"),
            ("container_play", "Colocar e tirar", "Blocks", "Objetos dentro/fora de caixas"),
            ("stacking", "Empilhar", "Blocks", "Blocos, copos, objetos"),
            ("shape_sorting", "Encaixar formas", "Shapes", "Classificar por forma"),
            ("puzzles", "Quebra-cabeças", "Puzzle", "Puzzles simples"),
            ("art_crayons", "Arte e rabiscos", "Palette", "Giz de cera grosso, tinta"),
            ("self_feeding", "Comer sozinho", "Baby", "Prática com colher e copo"),
            ("helper_tasks", "Tarefas de ajudante", "Hand", "Guardar objetos, levar guardanapo"),
        ],
    ),
    (
        "gross_motor",
        "Motricidade Grossa & Ativo",
        "text-teal-500",
        "bg-baby-mint/40",
        "Footprints",
        [
            ("tummy_time", "Bruços", "Baby", "Tempo de barriga (30min/dia)"),
            ("rolling_reaching", "Rolar e alcançar", "Move3d", "Rolar para pegar brinquedos"),
            ("kicking_reaching", "Chutar e alcançar", "Footprints", "Jogos de chutar e alcançar"),
            ("crawl_chase", "Engatinhar e perseguir", "Footprints", "Jogos de engatinhar"),
            ("walk_run_climb", "Andar, correr, subir", "Footprints", "Movimentação livre"),
            ("ball_play", "Brincadeira com bola", "Move3d", "Rolar, chutar, perseguir bola"),
            ("dance_music", "Dançar com música", "Music", "Mover-se ao som de música"),
            ("go_games", "Jogos de movimento", "Footprints", "Preparar, apontar, já!"),
        ],
    ),
    (
        "cognitive",
        "Cognitivo & Resolução de Problemas",
        "text-violet-500",
        "bg-baby-lavender/40",
        "Brain",
        [
            ("peekaboo", "Cadê? Achou!", "Eye", "Esconder e revelar rosto/objetos"),
            ("hide_find", "Esconder e achar", "Brain", "Esconder brinquedo sob pano"),
            ("cause_effect", "Causa e efeito", "Sparkles", "Apertar botão = algo acontece"),
            ("sorting", "Classificar", "Shapes", "Separar por cor/forma"),
            ("counting", "Contar objetos", "Brain", "Contar partes do corpo, degraus"),
            ("problem_solving", "Resolver problemas", "Puzzle", "Apoiar tentativas de solução"),
        ],
    ),
    (
        "socioemotional",
        "Social-Emocional",
        "text-rose-500",
        "bg-baby-pink/40",
        "Smile",
        [
            ("label_feelings", "Nomear emoções", "Smile", "Dar palavras aos sentimentos"),
            ("gentle_rules", "Toque gentil e regras", "Heart", "Modelar toque suave"),
            ("praise_behavior", "Elogiar comportamento", "Star", "Reforço positivo"),
            ("empathy_talk", "Conversa sobre empatia", "Users", "Comentar emoções dos outros"),
            ("offer_choices", "Oferecer escolhas", "Sparkles", "Camiseta vermelha ou azul?"),
            ("peer_play", "Brincar com outras crianças", "Users", "Interação e divisão"),
        ],
    ),
    (
        "nature",
        "Natureza & Ar Livre",
        "text-green-600",
        "bg-green-100",
        "TreePine",
        [
            ("outdoor_walk", "Passeio ao ar livre", "Sun", "Caminhada em área natural"),
            ("plant_contact", "Contato com plantas", "Leaf", "Tocar folhas, flores, grama"),
            ("water_play", "Brincar com água", "Droplets", "Com supervisão constante"),
            ("earth_play", "Brincar com terra", "TreePine", "Areia, terra, gravetos"),
            ("rain_play", "Brincar na chuva", "CloudRain", "Poças, barragens, barquinhos"),
            ("playground", "Parquinho", "Footprints", "Balanço, escorrega"),
            ("outdoor_picnic", "Piquenique", "Sun", "Comer ao ar livre em família"),
        ],
    ),
]


def main():
    categories = []
    for cid, label, color, bg, cicon, acts in DATA:
        categories.append(
            {
                "id": cid,
                "label": label,
                "color": color,
                "bgColor": bg,
                "icon": cicon,
                "activities": [
                    {"id": a[0], "label": a[1], "icon": a[2], "description": a[3]}
                    for a in acts
                ],
            }
        )
    out = {
        "categories": categories,
        "durationOptions": [5, 10, 15, 20, 30, 45, 60],
        "initialLogs": [
            {"id": "1", "time": "09:30", "type": "tummy_time", "label": "Bruços", "duration": 15, "notes": ""},
            {"id": "2", "time": "10:15", "type": "picture_book", "label": "Livro de figuras", "duration": 10, "notes": "O Gato Xadrez"},
            {"id": "3", "time": "11:00", "type": "container_play", "label": "Colocar e tirar", "duration": 15, "notes": "Blocos na caixa"},
            {"id": "4", "time": "14:30", "type": "outdoor_walk", "label": "Passeio ao ar livre", "duration": 30, "notes": "Praça"},
            {"id": "5", "time": "16:00", "type": "peekaboo", "label": "Cadê? Achou!", "duration": 5, "notes": ""},
        ],
        "weekData": [
            {"day": "Seg", "min": 65},
            {"day": "Ter", "min": 80},
            {"day": "Qua", "min": 45},
            {"day": "Qui", "min": 70},
            {"day": "Sex", "min": 55},
            {"day": "Sáb", "min": 90},
            {"day": "Dom", "min": 75},
        ],
        "defaultFavoriteActivityIds": ["tummy_time", "picture_book", "outdoor_walk", "container_play"],
    }
    ROOT.mkdir(parents=True, exist_ok=True)
    (ROOT / "activity_v2.json").write_text(json.dumps(out, ensure_ascii=False, indent=2), encoding="utf-8")
    print("Wrote activity_v2.json")


if __name__ == "__main__":
    main()
