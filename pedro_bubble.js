/* ============================================================
   PEDRO — bolha de chat flutuante para o dashboard
   ------------------------------------------------------------
   Widget independente, em JS puro (sem React, sem dependências).
   Roda por conta própria, então não interfere com o bundle do
   dashboard nem precisa ser mesclado nele.

   Aponta para o mesmo webhook n8n que o PEDRO já usa:
     POST { message, sessionId } -> lê { output | reply | text | ... }

   Para trocar de webhook, ajuste WEBHOOK_URL abaixo.
   ============================================================ */
(function () {
  var WEBHOOK_URL = 'https://gibs-sindusfarma.app.n8n.cloud/webhook/pes-ai-chat';

  var COLORS = {
    bg: '#0e1c3d',
    bg2: '#122a52',
    border: '#22406e',
    text: '#f0f6ff',
    text2: '#9fc0db',
    accent: '#00e5c0',
    accentInk: '#052a24',
    inset: '#0a1730'
  };

  function whenDashboardReady(cb) {
    var tries = 0;
    var iv = setInterval(function () {
      tries++;
      if (!document.body) return;
      if (document.querySelector('[data-screen-label]') || tries > 100) {
        clearInterval(iv);
        cb();
      }
    }, 80);
  }

  function mount() {
    if (document.getElementById('pedro-widget-root')) return; // evita duplicar

    var sessionId = 'pes-' + Math.random().toString(36).slice(2, 11);
    var busy = false;

    var root = document.createElement('div');
    root.id = 'pedro-widget-root';
    root.style.cssText =
      'position:fixed;bottom:22px;right:22px;z-index:99999;' +
      'font-family:Manrope,system-ui,-apple-system,sans-serif;';
    document.body.appendChild(root);

    var launcher = document.createElement('button');
    launcher.setAttribute('aria-label', 'Falar com o PEDRO');
    launcher.style.cssText =
      'width:56px;height:56px;border-radius:50%;border:none;cursor:pointer;' +
      'background:' + COLORS.accent + ';color:' + COLORS.accentInk + ';' +
      'box-shadow:0 10px 26px -8px rgba(0,0,0,.55);display:flex;' +
      'align-items:center;justify-content:center;transition:transform .15s;';
    launcher.onmouseenter = function () { launcher.style.transform = 'scale(1.06)'; };
    launcher.onmouseleave = function () { launcher.style.transform = 'scale(1)'; };
    launcher.innerHTML =
      '<svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
      'stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>';
    root.appendChild(launcher);

    var panel = document.createElement('div');
    panel.style.cssText =
      'display:none;flex-direction:column;position:absolute;bottom:70px;right:0;' +
      'width:340px;max-width:calc(100vw - 40px);height:480px;' +
      'max-height:calc(100vh - 120px);background:' + COLORS.bg + ';' +
      'border:1px solid ' + COLORS.border + ';border-radius:14px;overflow:hidden;' +
      'box-shadow:0 22px 55px -18px rgba(0,0,0,.6);';
    root.appendChild(panel);

    var header = document.createElement('div');
    header.style.cssText =
      'background:' + COLORS.bg2 + ';padding:12px 14px;display:flex;' +
      'align-items:center;justify-content:space-between;border-bottom:1px solid ' + COLORS.border + ';flex-shrink:0;';
    var title = document.createElement('span');
    title.style.cssText = 'font-size:13px;font-weight:700;color:' + COLORS.text + ';';
    title.textContent = 'PEDRO · Assistente do PES';
    var closeBtn = document.createElement('button');
    closeBtn.innerHTML = '&times;';
    closeBtn.setAttribute('aria-label', 'Fechar');
    closeBtn.style.cssText =
      'background:none;border:none;color:' + COLORS.text2 + ';font-size:20px;' +
      'cursor:pointer;line-height:1;padding:0 2px;';
    header.appendChild(title);
    header.appendChild(closeBtn);
    panel.appendChild(header);

    var body = document.createElement('div');
    body.style.cssText =
      'flex:1;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:9px;';
    panel.appendChild(body);

    var welcome = document.createElement('div');
    welcome.style.cssText = 'color:' + COLORS.text2 + ';font-size:12.5px;line-height:1.6;';
    welcome.textContent =
      'Olá! Eu sou o PEDRO, assistente virtual do PES. Posso ajudar com recibos, ' +
      'boletos, prazos e a política de cancelamento. Como posso ajudar você hoje?';
    body.appendChild(welcome);

    var footer = document.createElement('div');
    footer.style.cssText =
      'display:flex;gap:8px;padding:10px 12px;border-top:1px solid ' + COLORS.border + ';flex-shrink:0;';
    var input = document.createElement('input');
    input.placeholder = 'Pergunte ao PEDRO...';
    input.style.cssText =
      'flex:1;background:' + COLORS.inset + ';border:1px solid ' + COLORS.border + ';' +
      'color:' + COLORS.text + ';padding:9px 12px;border-radius:9px;font-size:13px;font-family:inherit;';
    var sendBtn = document.createElement('button');
    sendBtn.textContent = 'Enviar';
    sendBtn.style.cssText =
      'background:' + COLORS.accent + ';color:' + COLORS.accentInk + ';border:none;' +
      'border-radius:9px;padding:9px 14px;font-size:13px;font-weight:700;cursor:pointer;flex-shrink:0;';
    footer.appendChild(input);
    footer.appendChild(sendBtn);
    panel.appendChild(footer);

    function addBubble(role, text) {
      if (welcome.parentNode) welcome.remove();
      var isUser = role === 'user';
      var b = document.createElement('div');
      b.style.cssText =
        'align-self:' + (isUser ? 'flex-end' : 'flex-start') + ';max-width:85%;' +
        'padding:9px 12px;border-radius:' + (isUser ? '12px 12px 3px 12px' : '12px 12px 12px 3px') + ';' +
        'font-size:12.5px;line-height:1.5;white-space:pre-wrap;' +
        'background:' + (isUser ? COLORS.accent : COLORS.inset) + ';' +
        'color:' + (isUser ? COLORS.accentInk : COLORS.text) + ';' +
        'border:' + (isUser ? 'none' : '1px solid ' + COLORS.border) + ';';
      b.textContent = text;
      body.appendChild(b);
      body.scrollTop = body.scrollHeight + 600;
      return b;
    }

    function pickReply(data) {
      if (data == null) return 'Não recebi resposta.';
      if (typeof data === 'string') return data;
      if (Array.isArray(data)) data = data[0] || {};
      var val = data.output ?? data.reply ?? data.text ?? data.message ?? data.answer ?? data.response;
      return val != null ? String(val) : JSON.stringify(data);
    }

    function send() {
      var text = input.value.trim();
      if (!text || busy) return;
      input.value = '';
      addBubble('user', text);
      busy = true;
      sendBtn.disabled = true;
      var pending = addBubble('assistant', 'digitando...');
      fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, sessionId: sessionId })
      })
        .then(function (res) { return res.text(); })
        .then(function (raw) {
          var data;
          try { data = JSON.parse(raw); } catch (e) { data = raw; }
          pending.textContent = pickReply(data);
        })
        .catch(function () {
          pending.textContent =
            'Não consegui falar com o PEDRO agora. Tente novamente em instantes.';
        })
        .finally(function () {
          busy = false;
          sendBtn.disabled = false;
          body.scrollTop = body.scrollHeight + 600;
        });
    }

    var open = false;
    launcher.onclick = function () {
      open = !open;
      panel.style.display = open ? 'flex' : 'none';
      if (open) input.focus();
    };
    closeBtn.onclick = function () {
      open = false;
      panel.style.display = 'none';
    };
    sendBtn.onclick = send;
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        send();
      }
    });
  }

  whenDashboardReady(mount);
})();
