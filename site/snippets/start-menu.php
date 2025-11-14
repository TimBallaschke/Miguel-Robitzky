<?php
/**
 * Start Menu Component
 * Alpine.js powered menu with unfolding/folding items
 */

// Number of menu items (can be made dynamic based on content)
$menuItems = 4;
?>

<div class="start-menu-container" x-data="{ activeItem: null }">
    <div class="start-menu" :class="{ 'content-unfolded': activeItem !== null }">
        <?php for ($i = 1; $i <= $menuItems; $i++): ?>
            <div 
                id="start-menu-item-<?= $i ?>" 
                class="start-menu-item"
                :class="{ 
                    'unfolded': activeItem !== null && activeItem >= <?= $i ?>, 
                    'folded': activeItem !== null && activeItem !== <?= $i ?>, 
                    'clicked-menu-item': activeItem === <?= $i ?> 
                }"
                @click="activeItem = <?= $i ?>"
            >
                <?php if ($i > 1): ?>
                    <div class="start-menu-item-placeholder-before">
                        <div class="placeholder-before-inner">
                            <div class="start-menu-radius"></div>
                            <div class="start-menu-radius-cut-out"></div>
                        </div>
                    </div>
                <?php endif; ?>
                
                <div class="start-menu-item-button"></div>
                
                <?php if ($i < $menuItems): ?>
                    <div class="start-menu-item-placeholder-after">
                        <div class="placeholder-after-inner">
                            <div class="start-menu-radius"></div>
                            <div class="start-menu-radius-cut-out"></div>
                        </div>
                    </div>
                <?php endif; ?>
            </div>
        <?php endfor; ?>
    </div>
</div>

