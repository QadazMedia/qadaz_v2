document.addEventListener('DOMContentLoaded', () => {
  // Fade-in on scroll
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));

  // Countdown timer
  const countdownEl = document.getElementById('countdown');
  const timerStatusEl = document.getElementById('timerStatus');
  let remaining = 120; // seconds

  function formatTime(s) {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  }

  if (countdownEl) {
    countdownEl.textContent = formatTime(remaining);
    const interval = setInterval(() => {
      remaining -= 1;
      if (remaining <= 0) {
        clearInterval(interval);
        countdownEl.textContent = '00:00';
        if (timerStatusEl) timerStatusEl.textContent = 'Уақыт аяқталды ⏳';
        return;
      }
      countdownEl.textContent = formatTime(remaining);
    }, 1000);
  }

  // Form validation and submission
  const form = document.getElementById('leadForm');
  const successMessage = document.getElementById('successMessage');
  const scriptURL = 'https://script.google.com/macros/s/AKfycbyCsE2vJMQR7GXl-yJzc78rNPE2TjoDX0z8cpAa5H65P3nSwG8_C14THpTnXPhNPhxLzA/exec';

  // Modal open/close
  const modal = document.getElementById('formModal');
  const openBtns = document.querySelectorAll('.js-open-modal');
  const closeEls = modal ? modal.querySelectorAll('[data-close]') : [];

  function openModal() {
    if (!modal) return;
    modal.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }
  function closeModal() {
    if (!modal) return;
    modal.classList.remove('is-open');
    document.body.style.overflow = '';
  }
  openBtns.forEach(btn => btn.addEventListener('click', (e) => { e.preventDefault(); openModal(); }));
  closeEls.forEach(el => el.addEventListener('click', closeModal));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

  function setError(name, message) {
    const span = document.querySelector(`.error[data-for="${name}"]`);
    if (span) span.textContent = message || '';
  }

  function getRadioValue(name) {
    const checked = document.querySelector(`input[name="${name}"]:checked`);
    return checked ? checked.value : '';
  }

  function validate(formEl) {
    let valid = true;
    const name = formEl.name.value.trim();
    const grade = getRadioValue('grade');
    const major = getRadioValue('major');
    const phone = formEl.phone.value.trim();

    setError('name');
    setError('grade');
    setError('major');
    setError('phone');

    if (!name) {
      setError('name', 'Есіміңді енгіз');
      valid = false;
    }

    if (!grade) {
      setError('grade', 'Сыныбыңды таңда');
      valid = false;
    }

    if (!major) {
      setError('major', 'Мамандықты таңда');
      valid = false;
    }

    const phoneDigits = phone.replace(/\D/g, '');
    if (phoneDigits.length < 11) {
      setError('phone', 'Телефон номерін дұрыс енгіз');
      valid = false;
    }

    return {
      valid,
      data: { name, grade, major, phone }
    };
  }

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const result = validate(form);
      if (!result.valid) return;
    
      const formData = result.data;
    
      // Show loading state
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.textContent = 'Жіберілуде...';
      submitBtn.disabled = true;
    
      try {
        // 🚀 SEND DATA TO GOOGLE SHEETS VIA PROXY
        const response = await fetch(
          'https://corsproxy.io/?https://script.google.com/macros/s/AKfycbyCsE2vJMQR7GXl-yJzc78rNPE2TjoDX0z8cpAa5H65P3nSwG8_C14THpTnXPhNPhxLzA/exec',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
          }
        );
    
        try {
          const text = await response.text();
          console.log('✅ Server response:', text);
          form.reset();
          window.location.href = 'https://qadaz.tilda.ws/thankyoupage';
        } catch (err) {
          console.error('Response parsing error:', err);
          alert('Қате орын алды. Кейінірек байқап көріңіз.');
        }
      } catch (err) {
        console.error('Form submission error:', err);
        alert('Қате орын алды. Кейінірек байқап көріңіз.');
      } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      }
    });
    
  }
});
