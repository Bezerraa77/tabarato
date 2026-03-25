import os
import time
import random
import requests
from datetime import datetime

# ===== CONFIGURAÇÕES =====
TELEGRAM_TOKEN = os.environ.get("TELEGRAM_TOKEN", "SEU_TOKEN_AQUI")
CANAL_ID = os.environ.get("CANAL_ID", "@tabarato_promocoes")
ML_AFILIADO_ID = "beda7894236"
SHOPEE_AFILIADO = ""  # Adicionar quando tiver
DESCONTO_MINIMO = 10
INTERVALO_MINUTOS = 30

# Termos de busca por categoria
CATEGORIAS = [
    # Eletrônicos
    "iPhone", "Samsung Galaxy", "Notebook", "Smart TV", "Headphone",
    "Fone de Ouvido", "Tablet", "Smartwatch", "Caixa de Som",
    # Moda
    "Tênis Nike", "Tênis Adidas", "Camiseta", "Vestido", "Bolsa",
    "Calça Jeans", "Perfume", "Relógio",
    # Games
    "Controle PS5", "Nintendo Switch", "Headset Gamer", "Mouse Gamer",
    "Teclado Gamer", "Cadeira Gamer", "Xbox",
    # Casa e Cozinha
    "Airfryer", "Cafeteira", "Liquidificador", "Aspirador", "Ventilador",
    "Panela de Pressão", "Micro-ondas", "Chaleira Elétrica",
]

produtos_postados = set()

def buscar_ml(query):
    """Busca produtos no Mercado Livre"""
    try:
        url = f"https://api.mercadolibre.com/sites/MLB/search?q={requests.utils.quote(query)}&limit=10"
        resp = requests.get(url, timeout=10)
        data = resp.json()
        return data.get("results", [])
    except Exception as e:
        print(f"Erro ao buscar ML: {e}")
        return []

def filtrar_promocoes(produtos):
    """Filtra produtos com desconto mínimo"""
    promocoes = []
    for p in produtos:
        preco_atual = p.get("price", 0)
        preco_original = p.get("original_price")
        
        if preco_original and preco_original > preco_atual:
            desconto = round((1 - preco_atual / preco_original) * 100)
            if desconto >= DESCONTO_MINIMO:
                p["desconto"] = desconto
                promocoes.append(p)
    
    return sorted(promocoes, key=lambda x: x["desconto"], reverse=True)

def gerar_link_afiliado(url):
    """Gera link com ID de afiliado"""
    sep = "&" if "?" in url else "?"
    return f"{url}{sep}aff_id={ML_AFILIADO_ID}"

def formatar_mensagem(produto):
    """Formata mensagem bonita para o Telegram"""
    titulo = produto.get("title", "")[:60]
    preco = produto.get("price", 0)
    preco_original = produto.get("original_price", 0)
    desconto = produto.get("desconto", 0)
    frete_gratis = produto.get("shipping", {}).get("free_shipping", False)
    link = gerar_link_afiliado(produto.get("permalink", ""))
    
    # Emojis baseados no desconto
    if desconto >= 50:
        emoji_desconto = "🔥🔥🔥"
    elif desconto >= 30:
        emoji_desconto = "🔥🔥"
    else:
        emoji_desconto = "🔥"

    preco_fmt = f"R$ {preco:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")
    original_fmt = f"R$ {preco_original:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")
    
    frete_txt = "✅ Frete Grátis!" if frete_gratis else "🚚 Frete a calcular"
    hora = datetime.now().strftime("%H:%M")
    
    msg = f"""{emoji_desconto} *OFERTA IMPERDÍVEL* {emoji_desconto}

📦 *{titulo}*

💸 De: ~~{original_fmt}~~
💚 *Por: {preco_fmt}*
🏷️ *Desconto: -{desconto}%*

{frete_txt}

🛒 [COMPRAR AGORA]({link})

⏰ Oferta válida enquanto durar | {hora}
📢 @tabarato_promocoes"""
    
    return msg

def enviar_telegram(mensagem):
    """Envia mensagem para o canal do Telegram"""
    url = f"https://api.telegram.org/bot{TELEGRAM_TOKEN}/sendMessage"
    payload = {
        "chat_id": CANAL_ID,
        "text": mensagem,
        "parse_mode": "Markdown",
        "disable_web_page_preview": False
    }
    try:
        resp = requests.post(url, json=payload, timeout=10)
        data = resp.json()
        if data.get("ok"):
            print(f"✅ Mensagem enviada com sucesso! [{datetime.now().strftime('%H:%M:%S')}]")
            return True
        else:
            print(f"❌ Erro ao enviar: {data}")
            return False
    except Exception as e:
        print(f"❌ Erro de conexão: {e}")
        return False

def buscar_e_postar():
    """Busca uma promoção e posta no canal"""
    global produtos_postados
    
    # Escolhe uma categoria aleatória
    categoria = random.choice(CATEGORIAS)
    print(f"\n🔍 Buscando: {categoria} [{datetime.now().strftime('%H:%M:%S')}]")
    
    produtos = buscar_ml(categoria)
    promocoes = filtrar_promocoes(produtos)
    
    if not promocoes:
        print(f"⚠️ Nenhuma promoção encontrada para: {categoria}")
        return False
    
    # Pega o melhor desconto que ainda não foi postado
    for produto in promocoes:
        produto_id = produto.get("id")
        if produto_id not in produtos_postados:
            msg = formatar_mensagem(produto)
            sucesso = enviar_telegram(msg)
            if sucesso:
                produtos_postados.add(produto_id)
                # Limpa cache quando ficar muito grande
                if len(produtos_postados) > 500:
                    produtos_postados = set(list(produtos_postados)[-200:])
                print(f"📢 Postado: {produto.get('title', '')[:50]} | -{produto['desconto']}%")
                return True
    
    print(f"⚠️ Todos os produtos já foram postados")
    return False

def main():
    print("=" * 50)
    print("🤖 TáBarato Bot - Iniciando...")
    print(f"📢 Canal: {CANAL_ID}")
    print(f"⏰ Intervalo: {INTERVALO_MINUTOS} minutos")
    print(f"💰 Desconto mínimo: {DESCONTO_MINIMO}%")
    print("=" * 50)
    
    # Enviar mensagem de boas-vindas
    boas_vindas = """🟢 *TáBarato Bot Ativo!*

Olá! Estou online e funcionando! 🤖

A cada 30 minutos vou trazer as melhores promoções do Mercado Livre pra você! 🔥

📦 Eletrônicos | 👟 Moda | 🎮 Games | 🏠 Casa

Compartilhe com amigos e família! 👇"""
    
    enviar_telegram(boas_vindas)
    
    while True:
        try:
            buscar_e_postar()
        except Exception as e:
            print(f"❌ Erro inesperado: {e}")
        
        print(f"\n⏳ Aguardando {INTERVALO_MINUTOS} minutos...")
        time.sleep(INTERVALO_MINUTOS * 60)

if __name__ == "__main__":
    main()
