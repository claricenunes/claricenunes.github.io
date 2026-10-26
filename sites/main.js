/* ─────────────────────────────────────────────────────────────
   CONFIGURAÇÃO DE CONTATO — único lugar para alterar.

   whatsapp: número com DDI + DDD + número, só dígitos
             (ex.: '5561900000000'). ⚠️ AINDA NÃO CONFIGURADO.
             Enquanto estiver vazio, o formulário envia por e-mail
             e nenhum link de WhatsApp aparece na página.
   email:    endereço público já usado no portfólio e no currículo.
   ───────────────────────────────────────────────────────────── */
const CONTACT = {
  whatsapp: '',
  email: 'euclaricenunes@gmail.com',
};

const whatsappNumber = CONTACT.whatsapp.replace(/\D/g, '');
const hasWhatsApp = /^\d{12,13}$/.test(whatsappNumber);
const waLink = (text) => `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`;

/* ── WhatsApp: só aparece quando o número estiver configurado ── */
if (hasWhatsApp) {
  document.querySelectorAll('[data-whatsapp-link]').forEach((a) => {
    a.href = waLink('Olá, Clarice! Vi seu site e gostaria de conversar sobre um site para o meu negócio.');
    a.target = '_blank';
    a.rel = 'noopener';
    a.hidden = false;
  });
}

/* ── Formulário de briefing ──
   Monta uma mensagem com as respostas e abre o WhatsApp (se configurado)
   ou o aplicativo de e-mail. Nada é enviado a servidores nem salvo aqui. */
const form = document.getElementById('briefing');
const submitBtn = document.getElementById('brief-submit');
const copyBtn = document.getElementById('brief-copy');
const errorEl = document.getElementById('form-error');
const noteEl = document.getElementById('form-note');
const statusEl = document.getElementById('form-status');

if (hasWhatsApp) {
  submitBtn.textContent = 'Enviar pelo WhatsApp';
  noteEl.textContent = 'Ao enviar, o WhatsApp abre com a mensagem pronta para você revisar. Nenhum dado fica salvo neste site.';
}

function readForm() {
  const fields = [...form.querySelectorAll('input, select, textarea')];
  let firstInvalid = null;
  fields.forEach((field) => {
    const invalid = field.required && !field.value.trim();
    field.setAttribute('aria-invalid', String(invalid));
    if (invalid && !firstInvalid) firstInvalid = field;
  });
  errorEl.hidden = !firstInvalid;
  if (firstInvalid) {
    firstInvalid.focus();
    return null;
  }
  const v = Object.fromEntries(new FormData(form));
  Object.keys(v).forEach((k) => { v[k] = String(v[k]).trim(); });
  return v;
}

function buildMessage(v) {
  return [
    'Olá, Clarice! Gostaria de um orçamento para um site.',
    '',
    `Nome: ${v.nome}`,
    `Empresa ou negócio: ${v.negocio}`,
    `Tipo de site: ${v.tipo}`,
    `Objetivo: ${v.objetivo}`,
    `Prazo desejado: ${v.prazo}`,
    `Domínio: ${v.dominio}`,
  ].join('\n');
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const v = readForm();
  if (!v) return;
  const message = buildMessage(v);
  if (hasWhatsApp) {
    window.open(waLink(message), '_blank', 'noopener');
    statusEl.textContent = 'Abrimos o WhatsApp com a sua mensagem. É só revisar e enviar.';
  } else {
    const subject = `Orçamento de site — ${v.negocio}`;
    window.location.href = `mailto:${CONTACT.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
    statusEl.textContent = `Se o seu aplicativo de e-mail não abrir, use “Copiar mensagem” e envie para ${CONTACT.email}.`;
  }
});

copyBtn.addEventListener('click', async () => {
  const v = readForm();
  if (!v) return;
  try {
    await navigator.clipboard.writeText(buildMessage(v));
    statusEl.textContent = `Mensagem copiada. Cole no e-mail para ${CONTACT.email}${hasWhatsApp ? ' ou no WhatsApp' : ''}.`;
  } catch {
    statusEl.textContent = `Não foi possível copiar automaticamente. Envie suas respostas para ${CONTACT.email}.`;
  }
});

form.addEventListener('input', (e) => {
  if (e.target.getAttribute('aria-invalid') === 'true' && e.target.value.trim()) {
    e.target.setAttribute('aria-invalid', 'false');
    if (!form.querySelector('[aria-invalid="true"]')) errorEl.hidden = true;
  }
});

/* ── Cabeçalho com borda após rolar + CTA fixo no celular ──
   O CTA fixo some quando o formulário de contato está na tela. */
const header = document.querySelector('.site-header');
const sticky = document.getElementById('sticky-cta');
const contact = document.getElementById('contato');
let contactVisible = false;

function onScroll() {
  const y = window.scrollY;
  header.classList.toggle('scrolled', y > 8);
  sticky.classList.toggle('visible', y > window.innerHeight * 0.6 && !contactVisible);
}
new IntersectionObserver(([entry]) => {
  contactVisible = entry.isIntersecting;
  onScroll();
}, { rootMargin: '0px 0px -20% 0px' }).observe(contact);
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

/* ── Animação de entrada — a classe .motion é ligada no <head>
   só quando não há preferência por movimento reduzido ── */
if (document.documentElement.classList.contains('motion')) {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('in');
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));
}

document.getElementById('year').textContent = new Date().getFullYear();
