// Bottom dock for narrow screens (the CSS only shows it under 900 px): Menu opens the side panel as a drawer,
// Search opens it and focuses the search box, Cross-section toggles the slice box. Drawer and slice box never show together.

function init() {
  const $ = id => document.getElementById(id), mq = matchMedia('(max-width: 900px)');
  const dock = document.createElement('nav'); dock.id = 'dock'; dock.setAttribute('aria-label', 'Panels');
  dock.innerHTML = '<button class="b" data-d="menu" aria-expanded="false">Menu</button><button class="b" data-d="search">Search</button><button class="b" data-d="slice" aria-pressed="false">Cross-section</button>';
  document.body.appendChild(dock);
  const sliceShown = () => getComputedStyle($('slicebox')).display !== 'none';
  const sync = () => {
    const open = document.body.classList.contains('drawer-open'), sl = sliceShown() && mq.matches;
    dock.querySelector('[data-d=menu]').classList.toggle('on', open); dock.querySelector('[data-d=menu]').setAttribute('aria-expanded', open);
    dock.querySelector('[data-d=slice]').classList.toggle('on', sl); dock.querySelector('[data-d=slice]').setAttribute('aria-pressed', sl);
  };
  const drawer = on => { document.body.classList.toggle('drawer-open', on); if (on && sliceShown()) $('sliceclose').click(); sync(); };
  window.__drawer = drawer;
  const slice = on => { if (document.body.classList.contains('exploded')) return; if (on && !sliceShown()) { drawer(false); $('sliceopen').click(); } else if (!on && sliceShown()) $('sliceclose').click(); sync(); };
  dock.addEventListener('click', e => {
    const b = e.target.closest('[data-d]'); if (!b) return;
    if (b.dataset.d === 'menu') drawer(!document.body.classList.contains('drawer-open'));
    else if (b.dataset.d === 'search') { drawer(true); setTimeout(() => $('q').focus(), 60); }
    else slice(!sliceShown());
  });
  addEventListener('keydown', e => { if (e.key === 'Escape' && document.body.classList.contains('drawer-open')) drawer(false); });
  // tapping the 3D view with the drawer open closes it, so a selection is never hidden behind the sheet
  document.querySelector('three-d-stage').addEventListener('pointerdown', () => { if (mq.matches && document.body.classList.contains('drawer-open')) drawer(false); });
  // the stage's own export buttons and hint sit at the bottom edge, where the dock now is
  const lift = () => { const root = document.querySelector('three-d-stage').shadowRoot, tb = root.querySelector('.toolbar'), nt = root.querySelector('.note');
    if (tb) tb.style.bottom = mq.matches ? '70px' : ''; if (nt) nt.style.display = mq.matches ? 'none' : ''; };
  lift(); mq.addEventListener('change', () => { if (!mq.matches) document.body.classList.remove('drawer-open'); lift(); sync(); });
  // start with the 3D view clear on a phone
  if (mq.matches && sliceShown()) $('sliceclose').click();
  sync();
}

const wait = setInterval(() => {
  if (document.getElementById('sliceclose') && document.getElementById('sliceopen') && document.getElementById('q') && window.__select && document.querySelector('three-d-stage') && document.querySelector('three-d-stage')._renderer) { clearInterval(wait); init(); }
}, 150);
