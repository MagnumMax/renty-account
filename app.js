document.addEventListener('DOMContentLoaded', () => {
  let isAuthenticated = localStorage.getItem('renty_auth') === 'true';
  let activeModalId = null;
  let lastFocusedElement = null;
  let toastTimeoutId = 0;

  const viewLogin = document.getElementById('view-login');
  const viewApp = document.getElementById('view-app');
  const mainContent = document.getElementById('main-content');

  const emailForm = document.getElementById('login-step-email');
  const codeForm = document.getElementById('login-step-code');
  const emailInput = document.getElementById('login-email');
  const displayEmail = document.getElementById('display-email');
  const btnSendCode = document.getElementById('btn-send-code');
  const btnVerifyCode = document.getElementById('btn-verify-code');
  const otpInputs = Array.from(document.querySelectorAll('.otp-input'));

  const navItems = document.querySelectorAll('.nav-item[data-target]');
  const pages = document.querySelectorAll('.page-content');
  const btnLogoutDesktop = document.getElementById('btn-logout');
  const btnLogoutMobile = document.getElementById('btn-logout-mobile');

  const btnMobileMenu = document.getElementById('btn-mobile-menu');
  const btnMobileMenuClose = document.getElementById('btn-mobile-menu-close');
  const mobileDrawer = document.getElementById('mobile-drawer');
  const mobileDrawerOverlay = document.getElementById('mobile-drawer-overlay');

  const financeTabs = document.querySelectorAll('.finance-tab');
  const financeContents = document.querySelectorAll('.finance-content');

  const btnProfileDesktop = document.getElementById('btn-profile-desktop');
  const profileDropdownDesktop = document.getElementById('profile-dropdown-desktop');

  const btnCollapseSidebar = document.getElementById('btn-collapse-sidebar');
  const sidebarDesktop = document.getElementById('sidebar-desktop');
  const toastRegion = document.getElementById('toast-region');

  const isMobileDrawerOpen = () => !mobileDrawer.classList.contains('translate-x-full');
  const isAnyOverlayOpen = () => Boolean(activeModalId) || isMobileDrawerOpen();

  const focusableSelector = [
    'a[href]',
    'button:not([disabled])',
    'textarea:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ].join(', ');

  function getFocusableElements(container) {
    return Array.from(container.querySelectorAll(focusableSelector)).filter(
      (element) => !element.hasAttribute('hidden') && !element.classList.contains('hidden'),
    );
  }

  function syncBodyScrollLock() {
    document.body.classList.toggle('modal-open', isAnyOverlayOpen());
  }

  function showLogin() {
    viewApp.classList.add('hidden');
    viewLogin.classList.remove('hidden');
    emailForm.classList.remove('hidden');
    codeForm.classList.add('hidden');
    emailInput.focus();
  }

  function showApp() {
    viewLogin.classList.add('hidden');
    viewApp.classList.remove('hidden');
    viewApp.classList.add('flex');
    setInitialRoute();
  }

  function setNavItemState(item, isActive) {
    item.classList.toggle('active', isActive);
    item.setAttribute('aria-current', isActive ? 'page' : 'false');

    if (
      item.closest('#sidebar-desktop') ||
      item.closest('#profile-dropdown-desktop') ||
      item.closest('#mobile-drawer')
    ) {
      item.classList.toggle('bg-white/10', isActive);
      item.classList.toggle('text-white', isActive);
      item.classList.toggle('font-semibold', isActive);
      item.classList.toggle('text-white/85', !isActive);
      item.classList.toggle('font-medium', !isActive);
      return;
    }

    item.classList.toggle('bg-brand/10', isActive);
    item.classList.toggle('text-brand', isActive);
    item.classList.toggle('shadow-sm', isActive);
    item.classList.toggle('text-text-muted', !isActive);
  }

  function closeProfileDropdown() {
    if (profileDropdownDesktop) {
      profileDropdownDesktop.classList.add('hidden');
    }
  }

  function navigateTo(targetId, updateUrl = true) {
    navItems.forEach((item) => {
      setNavItemState(item, item.getAttribute('data-target') === targetId);
    });

    pages.forEach((page) => {
      const shouldShow = page.id === `page-${targetId}`;
      page.classList.toggle('hidden', !shouldShow);
      page.classList.toggle('block', shouldShow);
    });

    if (updateUrl) {
      window.history.pushState(null, '', `#${targetId}`);
    }

    closeMobileMenu(false);
    closeProfileDropdown();
    mainContent.focus();
  }

  function setInitialRoute() {
    const hash = window.location.hash.replace('#', '');
    if (hash && document.getElementById(`page-${hash}`)) {
      navigateTo(hash, false);
      return;
    }
    navigateTo('dashboard', false);
  }

  function openMobileMenu() {
    lastFocusedElement = document.activeElement;
    mobileDrawerOverlay.classList.remove('hidden');
    mobileDrawer.setAttribute('aria-hidden', 'false');
    btnMobileMenu.setAttribute('aria-expanded', 'true');

    requestAnimationFrame(() => {
      mobileDrawer.classList.remove('translate-x-full');
      btnMobileMenuClose.focus();
    });

    syncBodyScrollLock();
  }

  function closeMobileMenu(restoreFocus = true) {
    if (!mobileDrawer || mobileDrawer.classList.contains('translate-x-full')) {
      syncBodyScrollLock();
      return;
    }

    mobileDrawer.classList.add('translate-x-full');
    mobileDrawer.setAttribute('aria-hidden', 'true');
    btnMobileMenu.setAttribute('aria-expanded', 'false');

    window.setTimeout(() => {
      mobileDrawerOverlay.classList.add('hidden');
    }, 280);

    syncBodyScrollLock();

    if (restoreFocus && lastFocusedElement instanceof HTMLElement) {
      lastFocusedElement.focus();
    }
  }

  function openOverlay(overlayId) {
    if (!overlayId) return;

    if (overlayId === 'mobile-drawer') {
      openMobileMenu();
      return;
    }

    openModal(overlayId);
  }

  function closeOverlay(overlayId, restoreFocus = true) {
    if (!overlayId) return;

    if (overlayId === 'mobile-drawer') {
      closeMobileMenu(restoreFocus);
      return;
    }

    closeModal(overlayId, restoreFocus);
  }

  function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    lastFocusedElement = document.activeElement;
    activeModalId = modalId;

    if (modalId === 'modal-bottom-sheet') {
      const overlay = document.getElementById('modal-bottom-sheet-overlay');
      overlay.classList.remove('hidden');
      modal.classList.remove('hidden');
      modal.setAttribute('aria-hidden', 'false');
      requestAnimationFrame(() => {
        modal.classList.remove('translate-y-full');
      });
    } else {
      modal.classList.remove('hidden');
      modal.setAttribute('aria-hidden', 'false');
    }

    syncBodyScrollLock();

    const [firstFocusable] = getFocusableElements(modal);
    if (firstFocusable) {
      firstFocusable.focus();
    } else {
      modal.focus();
    }
  }

  function closeModal(modalId, restoreFocus = true) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    if (modalId === 'modal-bottom-sheet') {
      const overlay = document.getElementById('modal-bottom-sheet-overlay');
      modal.classList.add('translate-y-full');
      modal.setAttribute('aria-hidden', 'true');
      window.setTimeout(() => {
        modal.classList.add('hidden');
        overlay.classList.add('hidden');
      }, 280);
    } else {
      modal.classList.add('hidden');
      modal.setAttribute('aria-hidden', 'true');
    }

    if (activeModalId === modalId) {
      activeModalId = null;
    }

    syncBodyScrollLock();

    if (restoreFocus && lastFocusedElement instanceof HTMLElement) {
      lastFocusedElement.focus();
    }
  }

  function showToast(message, tone = 'info') {
    if (!toastRegion) return;

    if (toastTimeoutId) {
      window.clearTimeout(toastTimeoutId);
    }

    toastRegion.innerHTML = '';

    const toast = document.createElement('div');
    const titles = {
      info: 'Информация',
      success: 'Готово',
      error: 'Нужно внимание',
    };

    toast.className = 'toast';
    toast.dataset.tone = tone;
    toast.innerHTML = `
      <span class="toast-title">${titles[tone] || titles.info}</span>
      <span class="toast-copy">${message}</span>
    `;

    toastRegion.appendChild(toast);
    requestAnimationFrame(() => {
      toast.classList.add('is-visible');
    });

    toastTimeoutId = window.setTimeout(() => {
      toast.classList.remove('is-visible');
      window.setTimeout(() => toast.remove(), 240);
    }, 3600);
  }

  emailForm.addEventListener('submit', (event) => {
    event.preventDefault();

    if (!emailInput.checkValidity()) {
      emailInput.reportValidity();
      return;
    }

    const originalText = btnSendCode.innerHTML;
    btnSendCode.innerHTML = '<ion-icon name="sync-outline" class="animate-spin"></ion-icon> Отправка...';
    btnSendCode.disabled = true;
    displayEmail.textContent = emailInput.value.trim();

    window.setTimeout(() => {
      emailForm.classList.add('hidden');
      codeForm.classList.remove('hidden');
      btnSendCode.innerHTML = originalText;
      btnSendCode.disabled = false;
      otpInputs[0]?.focus();
    }, 800);
  });

  codeForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const otpCode = otpInputs.map((input) => input.value).join('');
    if (otpCode.length !== 4) {
      showToast('Введите все 4 цифры кода', 'error');
      otpInputs[0]?.focus();
      return;
    }

    const originalText = btnVerifyCode.innerHTML;
    btnVerifyCode.innerHTML = '<ion-icon name="sync-outline" class="animate-spin"></ion-icon> Проверка...';
    btnVerifyCode.disabled = true;

    window.setTimeout(() => {
      localStorage.setItem('renty_auth', 'true');
      isAuthenticated = true;
      btnVerifyCode.innerHTML = originalText;
      btnVerifyCode.disabled = false;
      showApp();
      showToast('Вы успешно вошли в кабинет', 'success');
    }, 1000);
  });

  otpInputs.forEach((input, index) => {
    input.addEventListener('input', () => {
      input.value = input.value.replace(/\D/g, '').slice(0, 1);
      if (input.value && otpInputs[index + 1]) {
        otpInputs[index + 1].focus();
      }
    });

    input.addEventListener('keydown', (event) => {
      if (event.key === 'Backspace' && !input.value && otpInputs[index - 1]) {
        otpInputs[index - 1].focus();
      }
    });
  });

  codeForm.addEventListener('paste', (event) => {
    const pastedText = event.clipboardData?.getData('text') ?? '';
    if (!/^\d{4}$/.test(pastedText)) return;

    event.preventDefault();
    pastedText.split('').forEach((digit, index) => {
      if (otpInputs[index]) {
        otpInputs[index].value = digit;
      }
    });
    otpInputs[3]?.focus();
  });

  const handleLogout = () => {
    localStorage.removeItem('renty_auth');
    isAuthenticated = false;
    closeOverlay(activeModalId || '', false);
    closeOverlay('mobile-drawer', false);
    showLogin();
    showToast('Вы вышли из кабинета', 'info');
  };

  btnLogoutDesktop?.addEventListener('click', handleLogout);
  btnLogoutMobile?.addEventListener('click', handleLogout);

  btnProfileDesktop?.addEventListener('click', (event) => {
    event.stopPropagation();
    profileDropdownDesktop.classList.toggle('hidden');
  });

  function handleDelegatedClick(event) {
    const target = event.target;
    const actionElement = target.closest('[data-overlay-open], [data-overlay-close], [data-toast-message]');

    if (profileDropdownDesktop && btnProfileDesktop && !profileDropdownDesktop.contains(target) && !btnProfileDesktop.contains(target)) {
      closeProfileDropdown();
    }

    if (!actionElement) {
      return;
    }

    if (actionElement.hasAttribute('data-overlay-open')) {
      event.preventDefault();
      openOverlay(actionElement.getAttribute('data-overlay-open'));
    }

    if (actionElement.hasAttribute('data-overlay-close')) {
      event.preventDefault();
      closeOverlay(actionElement.getAttribute('data-overlay-close'));
    }

    if (actionElement.hasAttribute('data-toast-message')) {
      showToast(
        actionElement.getAttribute('data-toast-message'),
        actionElement.getAttribute('data-toast-tone') || 'info',
      );
    }
  }

  document.addEventListener('click', handleDelegatedClick);

  navItems.forEach((item) => {
    item.addEventListener('click', (event) => {
      event.preventDefault();
      const targetId = item.getAttribute('data-target');
      navigateTo(targetId);
    });
  });

  window.addEventListener('hashchange', () => {
    const hash = window.location.hash.replace('#', '');
    if (hash && document.getElementById(`page-${hash}`)) {
      navigateTo(hash, false);
      return;
    }
    navigateTo('dashboard', false);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      if (activeModalId) {
        closeOverlay(activeModalId);
        return;
      }

      if (isMobileDrawerOpen()) {
        closeOverlay('mobile-drawer');
      }
    }
  });

  financeTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      financeTabs.forEach((item) => {
        item.classList.remove('bg-main', 'text-text-main', 'shadow-sm');
        item.classList.add('text-text-muted');
      });

      tab.classList.add('bg-main', 'text-text-main', 'shadow-sm');
      tab.classList.remove('text-text-muted');

      const targetId = tab.id === 'tab-invoices' ? 'content-invoices' : 'content-fines';
      financeContents.forEach((content) => {
        content.classList.toggle('hidden', content.id !== targetId);
      });
    });
  });

  if (btnCollapseSidebar && sidebarDesktop) {
    let isCollapsed = localStorage.getItem('renty_sidebar_collapsed') === 'true';

    const applySidebarState = () => {
      const sidebarNavItems = sidebarDesktop.querySelectorAll('.nav-item');

      if (isCollapsed) {
        sidebarDesktop.classList.remove('w-64', 'lg:w-72');
        sidebarDesktop.classList.add('w-20');
        document.querySelectorAll('.sidebar-text').forEach((element) => element.classList.add('hidden'));
        document.querySelectorAll('.sidebar-logo').forEach((element) => {
          element.classList.remove('gap-3', 'px-6');
          element.classList.add('justify-center', 'px-2');
        });
        btnCollapseSidebar.innerHTML = '<ion-icon name="chevron-forward-outline"></ion-icon>';
        btnCollapseSidebar.setAttribute('aria-label', 'Раскрыть боковое меню');

        sidebarNavItems.forEach((item) => {
          item.classList.remove('px-4', 'gap-3');
          item.classList.add('justify-center', 'px-0');
        });
      } else {
        sidebarDesktop.classList.remove('w-20');
        sidebarDesktop.classList.add('w-64', 'lg:w-72');
        document.querySelectorAll('.sidebar-text').forEach((element) => element.classList.remove('hidden'));
        document.querySelectorAll('.sidebar-logo').forEach((element) => {
          element.classList.add('gap-3', 'px-6');
          element.classList.remove('justify-center', 'px-2');
        });
        btnCollapseSidebar.innerHTML = '<ion-icon name="chevron-back-outline"></ion-icon>';
        btnCollapseSidebar.setAttribute('aria-label', 'Свернуть боковое меню');

        sidebarNavItems.forEach((item) => {
          item.classList.add('px-4', 'gap-3');
          item.classList.remove('justify-center', 'px-0');
        });
      }
    };

    applySidebarState();

    btnCollapseSidebar.addEventListener('click', () => {
      isCollapsed = !isCollapsed;
      localStorage.setItem('renty_sidebar_collapsed', String(isCollapsed));
      applySidebarState();
    });
  }

  function init() {
    if (isAuthenticated) {
      showApp();
      return;
    }
    showLogin();
  }

  init();
});
