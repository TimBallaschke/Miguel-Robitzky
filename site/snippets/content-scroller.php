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
        <div id="inner-scroller-1" class="inner-scroller">
            <!-- Add content for section 1 here -->
        </div>
        
        <div id="inner-scroller-2" class="inner-scroller">
            <div class="projects">
                <?php 
                // Get all project pages (children of the projekte page)
                $projektePages = $site->find('projekte');
                if ($projektePages && $projektePages->children()->isNotEmpty()): 
                    foreach ($projektePages->children() as $projekt): 
                ?>
                    <div class="project">
                        <div class="projects-images">
                            <?php 
                            $images = $projekt->images();
                            $imageCount = $images->count();
                            $index = 0;
                            foreach ($images as $image): 
                            ?>
                                <div class="project-image <?= $index === 0 ? 'active' : '' ?>">
                                    <img src="<?= $image->url() ?>" alt="<?= $projekt->title() ?>">
                                </div>
                            <?php 
                            $index++;
                            endforeach; 
                            
                            // Only show navigation arrows if there's more than one image
                            if ($imageCount > 1):
                            ?>
                                <button class="carousel-arrow carousel-arrow-left" aria-label="Previous image">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <polyline points="15 18 9 12 15 6"></polyline>
                                    </svg>
                                </button>
                                <button class="carousel-arrow carousel-arrow-right" aria-label="Next image">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <polyline points="9 18 15 12 9 6"></polyline>
                                    </svg>
                                </button>
                            <?php endif; ?>
                        </div>
                        <div class="project-text-container">
                            <div class="text-container-white-gradient"></div>
                            <div class="project-text-content">
                                <div class="project-text"><?= $projekt->text() ?></div>
                            </div>
                        </div>
                    </div>
                <?php 
                    endforeach;
                endif; 
                ?>
            </div>
        </div>
        
        <div id="inner-scroller-3" class="inner-scroller">
            <!-- Add content for section 3 here -->
        </div>
        
        <div id="inner-scroller-4" class="inner-scroller">
            <!-- Add content for section 4 here -->
        </div>
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

