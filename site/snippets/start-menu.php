<?php
/**
 * Start Menu Component
 * Alpine.js powered menu with unfolding/folding items
 */

// Number of menu items (can be made dynamic based on content)
$menuItems = 4;

// Menu item labels
$menuLabels = [
    1 => 'Biografie & Schaffen',
    2 => 'Projekte',
    3 => 'Pressebilder',
    4 => 'Kontakt'
];
?>

<div class="start-menu-container" x-data="{ activeItem: null, isDesktop: window.innerWidth > 768 }" @resize.window="isDesktop = window.innerWidth > 768">
    <div class="start-menu" :class="{ 'content-unfolded': isDesktop && activeItem !== null }">
        <?php for ($i = 1; $i <= $menuItems; $i++): ?>
            <div 
                id="start-menu-item-<?= $i ?>" 
                class="start-menu-item"
                :class="{ 
                    'unfolded': isDesktop && activeItem !== null && activeItem >= <?= $i ?>, 
                    'folded': isDesktop && activeItem !== null && activeItem !== <?= $i ?>, 
                    'no-opacity': isDesktop && activeItem !== null && activeItem !== <?= $i ?>,
                    'clicked-menu-item': isDesktop && activeItem === <?= $i ?>,
                    'no-radius': activeItem === <?= $i ?>,
                    'folded-mobile': !isDesktop && activeItem !== null,
                    'clicked-menu-item-mobile': !isDesktop && activeItem === <?= $i ?> 
                }"
                @click="activeItem = <?= $i ?>; document.body.classList.remove('start-menu-opened')"
            >
                <?php if ($i > 1): ?>
                    <div class="start-menu-item-placeholder-before">
                        <div class="placeholder-before-inner">
                            <div class="start-menu-radius"></div>
                            <div class="start-menu-radius-cut-out"></div>
                        </div>
                    </div>
                <?php endif; ?>
                
                <div class="start-menu-item-button">
                    <?php if ($i > 1): ?>
                        <div class="start-menu-item-button-inner-before"></div>
                        <div class="start-menu-item-button-inner-before-cut-out"></div>
                    <?php endif; ?>
                    <div class="button-content">
                        <div class="button-label"><?= $menuLabels[$i] ?></div>
                        <div class="button-plus"></div>
                    </div>
                    <div class="start-menu-item-button-inner-after"></div>
                    <div class="start-menu-item-button-inner-after-cut-out"></div>
                </div>
                
                <div class="start-menu-item-placeholder-after">
                    <div class="placeholder-after-inner">
                        <div class="start-menu-radius"></div>
                        <div class="start-menu-radius-cut-out"></div>
                    </div>
                </div>
            </div>
        <?php endfor; ?>
    </div>
    <div class="inner-scroller-placeholder"></div>
</div>

