const skewSpeed = 0.15; // Qué tan rápido se mueve el sesgo hacia el mouse, 1 = instantáneamente
const moveSpeed = 0.9; // Qué tan rápido se mueve el brillo hacia el mouse, 1 = instantáneamente
const snapThreshold = 0.005; // Qué tan cerca debe estar un valor del objetivo antes de que se ajuste a él (evita animaciones interminables)
const cards = document.querySelectorAll('.card');

cards.forEach(card => {
    const shine = card.querySelector('.js-feature-card-shine-mktg');
    const skew = shine.closest('.js-home-skew');
    let rect = card.getBoundingClientRect();
    
    const animationTargets = {
        x: 0,
        y: 0,
        skewX: 0,
        skewY: 0,
        shouldAnimate: false,
    }

    const currentState = {
        x: 0,
        y: 0,
        skewX: 0,
        skewY: 0,
        isAnimating: false,
    }

    card.addEventListener('mousemove', e => {
        if (animationTargets.shouldAnimate === false) {
            rect = card.getBoundingClientRect();
        }
        animationTargets.shouldAnimate = true;

        // Calcular la posición del mouse en relación con la tarjeta
        animationTargets.x = rect.width - (e.clientX - rect.left) - shine.offsetWidth / 2;
        animationTargets.y = rect.height - (e.clientY - rect.top) - shine.offsetHeight / 2;
        animationTargets.skewY = -((e.clientX - rect.left - rect.width / 2) / rect.width) * 3;
        animationTargets.skewX = ((e.clientY - rect.top - rect.height / 2) / rect.height) * 2;

        // Manejar si el evento mouseenter nunca se disparó
        if (currentState.isAnimating === false) {
            currentState.isAnimating = true;
            animationTargets.shouldAnimate = true;
            window.requestAnimationFrame(() => animateTowardsTarget(card, shine, skew, animationTargets, currentState));
        }
    });

    card.addEventListener('mouseenter', () => {
        rect = card.getBoundingClientRect();

    if (currentState.isAnimating === true) return
    currentState.isAnimating = true;
    animationTargets.shouldAnimate = true;
    window.requestAnimationFrame(() => animateTowardsTarget(card, shine, skew, animationTargets, currentState));
    });

    card.addEventListener('mouseleave', () => {
        animationTargets.skewX = 0;
        animationTargets.skewY = 0;
        animationTargets.shouldAnimate = false;
    });

    const observer = new IntersectionObserver(entries => {
        for (const entry of entries) {
            if (entry.isIntersecting) {
                rect = card.getBoundingClientRect()
            } else {
                animationTargets.shouldAnimate = false
            }
        }
    })
    
    observer.observe(card)

    function animateTowardsTarget(
        element,
        shine,
        skew,
        animationTargets,
        currentState
      ) {
        // Establezca la posición del elemento de brillo a través de las propiedades CSS superior e izquierda
        // Cree un ligero retraso yendo *hacia* el objetivo, en lugar de ajustarse a él
        currentState.x = goTowardsValue(currentState.x, animationTargets.x, moveSpeed);
        currentState.y = goTowardsValue(currentState.y, animationTargets.y, moveSpeed)
        currentState.skewX = goTowardsValue(currentState.skewX, animationTargets.skewX, skewSpeed);
        currentState.skewY = goTowardsValue(currentState.skewY, animationTargets.skewY, skewSpeed);
  
        // Detener si estamos realmente cerca de todos los objetivos
        if (
            Math.abs(animationTargets.x - currentState.x) < snapThreshold &&
            Math.abs(animationTargets.y - currentState.y) < snapThreshold &&
            Math.abs(animationTargets.skewX - currentState.skewX) < snapThreshold &&
            Math.abs(animationTargets.skewY - currentState.skewY) < snapThreshold &&
            animationTargets.shouldAnimate === false
        ) {
            currentState.isAnimating = false;
            return;
        }

        shine.style.setProperty('transform', `translate(${-currentState.x}px, ${-currentState.y / 2}px)`);
        skew.style.setProperty('transform',`perspective(700px) rotateX(${Math.round(currentState.skewX * 100) / 100}deg) rotateY(${Math.round(currentState.skewY * 100) / 100}deg)`,);
    
        window.requestAnimationFrame(() => animateTowardsTarget(element, shine, skew, animationTargets, currentState));
    }

    function goTowardsValue(current, target, speed) {
        return Math.round((current + (target - current) * speed) * 100) / 100;
    }
});