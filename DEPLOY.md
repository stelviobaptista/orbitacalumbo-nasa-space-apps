# Publicar no InfinityFree (grátis)

1. Cria conta em infinityfree.com e uma conta de alojamento (escolhe um subdomínio grátis).
2. Abre o painel > "Online File Manager" (ou liga por FTP com os dados do painel).
3. Entra na pasta `htdocs`. Apaga o que lá estiver (por exemplo `index2.html`).
4. Carrega o ficheiro `orbita-calumbo-deploy.zip` para dentro de `htdocs` e extrai-o ali.
   O `index.php` tem de ficar directamente em `htdocs`, não numa subpasta.
5. Em `htdocs`, copia `config.local.example.php` para `config.local.php` e edita:
       define('GEMINI_API_KEY', 'a-tua-chave-google');
       define('NASA_API_KEY',   'a-tua-chave-nasa');
6. Permissões: as pastas `cache` e `data` e o ficheiro `data/ranking.json` têm de ser graváveis (755, ou 775/666 se o ranking não guardar).
7. Abre `https://O-TEU-SUBDOMINIO/api/status.php?test=1` e confirma `claude_teste: ok` e `provider: Gemini`.
8. Abre `https://O-TEU-SUBDOMINIO/` e testa cada página.

## Se algo falhar
- Página em branco: no painel, activa a visualização de erros do PHP ou vê o log de erros.
- Foto do dia/asteroides sem dados: a chave da NASA está errada ou excedeste o limite.
- Astrónomo em modo básico: o campo "Motivo" diz porquê (chave, modelo ou limite da IA).
- Ranking não guarda: dá permissão de escrita a `data/ranking.json`.
- Depois de tudo a funcionar, podes apagar `api/status.php` para não expor o diagnóstico.
