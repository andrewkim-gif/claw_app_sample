/**
 * CrossClaw Sample Counter App
 * SDK 기능 데모: storage, notifications, window API
 */

const $ = (sel) => document.querySelector(sel);

let count = 0;

function updateDisplay() {
  $('#count').textContent = count;
}

async function init() {
  const statusEl = $('#status');
  const visitsEl = $('#visits');

  // CrossClaw SDK 연결 확인
  if (!window.CrossClaw) {
    statusEl.textContent = 'Standalone mode (no SDK)';
    statusEl.className = 'status disconnected';
    visitsEl.textContent = 'Visits: N/A';
    setupButtons();
    return;
  }

  statusEl.textContent = 'Connected to CrossClaw OS';
  statusEl.className = 'status connected';

  try {
    // 윈도우 타이틀 설정
    await window.CrossClaw.window.setTitle('Sample Counter');

    // 방문 횟수 로드/저장
    const visits = (await window.CrossClaw.storage.get('visitCount')) ?? 0;
    const nextVisits = Number(visits) + 1;
    await window.CrossClaw.storage.set('visitCount', nextVisits);
    visitsEl.textContent = `Visits: ${nextVisits}`;

    // 이전 카운터 값 복원
    const saved = await window.CrossClaw.storage.get('counterValue');
    if (saved !== null && saved !== undefined) {
      count = Number(saved);
      updateDisplay();
    }
  } catch (err) {
    console.warn('SDK init error:', err);
  }

  setupButtons();
}

function setupButtons() {
  $('#btn-inc').addEventListener('click', async () => {
    count++;
    updateDisplay();
    await saveCount();

    // 10의 배수마다 알림
    if (count > 0 && count % 10 === 0 && window.CrossClaw) {
      await window.CrossClaw.notifications.show(
        'Milestone!',
        `Counter reached ${count}! 🎉`
      );
    }
  });

  $('#btn-dec').addEventListener('click', async () => {
    count--;
    updateDisplay();
    await saveCount();
  });

  $('#btn-reset').addEventListener('click', async () => {
    count = 0;
    updateDisplay();
    await saveCount();
  });
}

async function saveCount() {
  if (window.CrossClaw) {
    try {
      await window.CrossClaw.storage.set('counterValue', count);
    } catch (err) {
      console.warn('Save error:', err);
    }
  }
}

// 라이프사이클 이벤트 등록
if (window.CrossClaw) {
  window.CrossClaw.lifecycle.onLaunch(() => {
    console.log('[SampleCounter] App launched');
  });

  window.CrossClaw.lifecycle.onDestroy(() => {
    console.log('[SampleCounter] App destroyed');
    saveCount(); // 종료 시 저장
  });
}

init();
