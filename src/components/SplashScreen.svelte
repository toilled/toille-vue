<div class="splash-screen">
  <div class="glitch" data-text="INITIALIZING...">INITIALIZING...</div>
</div>

<style>
.splash-screen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: #050510;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  color: #00ffcc;
  font-family: 'Courier New', Courier, monospace;
  font-size: 3rem;
  font-weight: bold;
}

.glitch {
  position: relative;
  color: #00ffcc;
  font-size: 4rem;
  letter-spacing: 0.5em;
  animation: glitch-skew 1s infinite linear alternate-reverse;
}

@media (max-width: 768px) {
  .glitch {
    font-size: 5.5vw;
    letter-spacing: 0.2em;
  }
}

.glitch::before {
  content: attr(data-text);
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  left: 2px;
  text-shadow: -2px 0 #ff00cc;
  clip-path: polygon(0 0, 100% 0, 100% 45%, 0 45%);
  animation: glitch-anim-1 5s infinite linear alternate-reverse;
  background-color: #050510;
}

.glitch::after {
  content: attr(data-text);
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  left: -2px;
  text-shadow: -2px 0 #00ccff;
  clip-path: polygon(0 55%, 100% 55%, 100% 100%, 0 100%);
  animation: glitch-anim-2 5s infinite linear alternate-reverse;
  background-color: #050510;
}

@keyframes glitch-anim-1 {
  0% {
    clip-path: inset(40% 0 61% 0);
  }
  20% {
    clip-path: inset(92% 0 1% 0);
  }
  40% {
    clip-path: inset(43% 0 1% 0);
  }
  60% {
    clip-path: inset(25% 0 58% 0);
  }
  80% {
    clip-path: inset(54% 0 7% 0);
  }
  100% {
    clip-path: inset(58% 0 43% 0);
  }
}

@keyframes glitch-anim-2 {
  0% {
    clip-path: inset(20% 0 30% 0);
  }
  20% {
    clip-path: inset(60% 0 10% 0);
  }
  40% {
    clip-path: inset(10% 0 50% 0);
  }
  60% {
    clip-path: inset(80% 0 5% 0);
  }
  80% {
    clip-path: inset(30% 0 20% 0);
  }
  100% {
    clip-path: inset(50% 0 30% 0);
  }
}

@keyframes glitch-skew {
  0% {
    transform: skew(1deg);
  }
  10% {
    transform: skew(-1deg);
  }
  20% {
    transform: skew(2deg);
  }
  30% {
    transform: skew(-2deg);
  }
  40% {
    transform: skew(1deg);
  }
  50% {
    transform: skew(-1deg);
  }
  60% {
    transform: skew(0.5deg);
  }
  70% {
    transform: skew(-0.5deg);
  }
  80% {
    transform: skew(1deg);
  }
  90% {
    transform: skew(-1deg);
  }
  100% {
    transform: skew(0deg);
  }
}
</style>
