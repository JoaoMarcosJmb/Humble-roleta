<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Allowlist Viewer</title>
  <style>
    body {
      font-family: "Segoe UI", Arial, sans-serif;
      background: linear-gradient(135deg, rgba(244,185,66,0.7), rgba(212,225,87,0.7)),
                  url("https://i.imgur.com/vATNRmF.png") no-repeat center center fixed;
      background-size: cover;
      margin: 0;
      padding: 0;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    header {
      width: 100%;
      max-width: 1200px;
      padding: 20px 30px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      color: white;
      text-shadow: 0 2px 6px rgba(0,0,0,0.6);
    }

    header h1 {
      font-size: 2.2rem;
      margin: 0;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    header h1 img {
      height: 50px;
      cursor: pointer;
    }

    .discord-link img {
      height: 50px;
      cursor: pointer;
      transition: transform 0.25s;
    }

    .discord-link img:hover {
      transform: scale(1.1);
    }

    .container {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 25px;
      width: 90%;
      max-width: 1200px;
      padding: 30px;
    }

    .card {
      background: white;
      border-radius: 16px;
      padding: 20px 15px;
      text-align: left;
      box-shadow: 0 6px 14px rgba(0,0,0,0.15);
      transition: transform 0.25s, box-shadow 0.25s;
      display: flex;
      align-items: center;
      gap: 15px;
      cursor: pointer;
      text-decoration: none;
      color: #333;
    }

    .card:hover {
      transform: translateY(-8px);
      box-shadow: 0 10px 20px rgba(0,0,0,0.25);
    }

    .card img {
      width: 80px;
      height: auto;
      border-radius: 8px;
    }

    .card-text {
      display: flex;
      flex-direction: column;
      justify-content: center;
    }

    .card-text h2 {
      margin: 0 0 5px 0;
      font-size: 1.4rem;
      color: #444;
    }

    .card-text p {
      margin: 0;
      font-size: 0.95rem;
      color: #666;
    }
  </style>
</head>
<body>
  <header>
    <!-- Mascote com link para o site principal -->
    <h1>
      <a href="https://www.humblepixelmon.com.br" target="_blank">
        <img src="https://i.imgur.com/XOEcuO8.png" alt="Mascote">
      </a>
      Carregando...
    </h1>

    <!-- Discord no topo -->
    <a href="https://discord.gg/whV6hbVRvk" target="_blank" class="discord-link">
      <img src="https://i.imgur.com/SimtTBt.png" alt="Discord">
    </a>
  </header>

  <div class="container" id="pokemonContainer"></div>

  <script>
  const container = document.getElementById("pokemonContainer");
  const title = document.querySelector("header h1");

  // Pega qual JSON carregar a partir da URL
  const params = new URLSearchParams(window.location.search);
  let file = params.get("file");

  // Valida o JSON
  if (!file || (file !== "allowlist_Monomon.json" && file !== "allowlist_Starters.json")) {
    title.textContent = "Erro: Arquivo não encontrado";
    container.innerHTML = "<p>Use ?file=allowlist_Monomon.json ou ?file=allowlist_Starters.json</p>";
  } else {
    fetch(file)
      .then(res => {
        if (!res.ok) throw new Error("Não foi possível carregar o JSON");
        return res.json();
      })
      .then(data => {
        title.textContent = file.includes("Monomon") ? "Monomon" : "Starters";

        if (!Array.isArray(data) || data.length === 0) {
          container.innerHTML = "<p>Nenhum Pokémon encontrado nessa tier.</p>";
          return;
        }

        data.forEach(p => {
          const card = document.createElement("div");
          card.className = "card";

          // Escolha de imagem local padrão se quiser
          const imgSrc = p.image ? p.image : (file.includes("Monomon") ? "img/Monomon.png" : "img/Starters.png");

          card.innerHTML = `
            <img src="${imgSrc}" alt="${p.name}">
            <div class="card-text">
              <h2>${p.name}</h2>
              <p>ID: ${p.id}</p>
            </div>
          `;
          container.appendChild(card);
        });
      })
      .catch(err => {
        console.err
