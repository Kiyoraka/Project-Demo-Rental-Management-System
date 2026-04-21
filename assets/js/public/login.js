// public/login.js — login form handler

import { login, redirectIfAuthed } from '../auth.js';
import { toast } from '../ui.js';

redirectIfAuthed();

document.getElementById('login-form')?.addEventListener('submit', (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  try {
    const target = login(email, password);
    toast({ variant: 'success', title: 'Signed in!' });
    setTimeout(() => { window.location.href = target; }, 400);
  } catch (err) {
    toast({ variant: 'error', title: err.message || 'Login failed' });
  }
});
