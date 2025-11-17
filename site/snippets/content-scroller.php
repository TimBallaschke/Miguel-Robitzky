<?php
/**
 * Content Scroller Component
 * Displays the main scroller with inner sections and numbered navigation
 */

// Number of sections (can be made dynamic based on content)
$sections = 4;
?>

<div class="content-container hidden">
    <div class="scroller first-connected">
        <?php for ($i = 1; $i <= $sections; $i++): ?>
            <div id="inner-scroller-<?= $i ?>" class="inner-scroller">
                <!-- <div class="image">
                    <img src="/assets/images/Bildschirmfoto2025-09-12um11.00.03.png" alt="Image <?= $i ?>" >
                </div> -->
            </div>
        <?php endfor; ?>
    </div>

    <div class="numbers">
        <?php for ($i = 1; $i <= $sections; $i++): ?>
            <div 
                id="number-<?= $i ?>-container" 
                class="number-container<?= $i === 1 ? ' connected' : '' ?>" 
                data-scroller="inner-scroller-<?= $i ?>"
            >
                <div class="number">
                    <?php if ($i > 1): ?>
                        <div class="number-before"></div>
                        <div class="number-before-cut-out"></div>
                    <?php endif; ?>
                    
                <div class="number-content"></div>
                
                <div class="number-after"></div>
                <div class="number-after-cut-out"></div>
                </div>
            </div>
        <?php endfor; ?>
    </div>
</div>

