# Órbita Calumbo · NASA Space Apps (Desafio 3)
Plataforma educativa de astronomia: missões, planetas em 3D, laboratório de gravidade, viagem espacial 3D, dados da NASA, astrónomo com IA e quiz.

## Páginas
- **Missões:** 4 missões (Marte, gravidade lunar, água noutros mundos, expedição a Júpiter). Cada uma tem problema, investigação, experiência, desafio e avaliação. O progresso fica guardado no navegador.
- **Planetas 3D:** 11 corpos (Sol, 8 planetas, Lua e Plutão) que se rodam com o rato ou o dedo; comparar dois corpos; Terra vs todos.
- **Laboratório:** massa e peso em cada mundo; lançamento e queda de objectos com a gravidade de cada corpo.
- **Viagem 3D:** simulador de nave pelo Sistema Solar com distância, duração e atraso do rádio.
- **Dados NASA:** foto do dia (traduzida) e radar de asteroides.
- **Astrónomo (IA) e Quiz.**

Os gráficos 3D são feitos em Canvas, sem bibliotecas externas: funcionam offline e em telemóveis modestos.

## Correr
    php -S localhost:8000
Abre http://localhost:8000 (tem de ser através do PHP).

## Configurar
1. Copia `config.local.example.php` para `config.local.php`.
2. Cola uma chave de IA grátis do Google Gemini (https://aistudio.google.com/apikey) e uma chave da NASA (https://api.nasa.gov). A chave da Claude é opcional e paga.
3. Diagnóstico: `/api/status.php` e `/api/status.php?test=1`.

Sem chave de IA o astrónomo funciona em modo básico. As pastas `cache/` e `data/` precisam de permissão de escrita.
As texturas dos planetas são geradas por código (ilustrativas, não fotografias).
