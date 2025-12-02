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
            <?php 
            // Get the Biografie und Schaffen page
            $biografiePage = $site->find('biografie-und-schaffen');
            if ($biografiePage): 
            ?>
                <div class="biografie-content">
                    <div class="mobile-scroll-gradient"></div>
                    <div class="biografie-title button-label"><?= $biografiePage->title() ?></div>
                    
                    <?php if ($biografiePage->kurzbiografie()->isNotEmpty()): ?>
                        <div class="kurzbiografie-section text-large  content-element hidden">
                            <div class="biografie-text"><?= $biografiePage->kurzbiografie()->kirbytext() ?></div>
                        </div>
                    <?php endif; ?>
                    
                    <?php if ($biografiePage->schaffen()->isNotEmpty()): ?>
                        <div class="schaffen-section text-small content-element hidden">
                            <div class="schaffen-text"><?= $biografiePage->schaffen()->kirbytext() ?></div>
                        </div>
                    <?php endif; ?>
                </div>
            <?php endif; ?>
        </div>
        
        <div id="inner-scroller-2" class="inner-scroller">
            <div class="projects">
                <?php 
                // Get all project pages (children of the projekte page)
                $projektePages = $site->find('projekte');
                if ($projektePages && $projektePages->children()->isNotEmpty()): 
                    $allProjects = $projektePages->children();
                    $totalProjects = $allProjects->count();
                    $currentIndex = 0;
                    foreach ($allProjects as $projekt):
                        $hasPrev = $currentIndex > 0;
                        $hasNext = $currentIndex < ($totalProjects - 1);
                        $currentIndex++; 
                ?>
                    <div class="project">
                        <div class="projects-images">
                            <div class="project-header offset-element offset-top">
                                <div class="projects-title button-label"><?= $projektePages->title() ?></div>
                                <div class="project-title text-large bold"><?= $projekt->title() ?></div>
                            </div>
                            <?php 
                            $images = $projekt->images();
                            $imageCount = $images->count();
                            $index = 0;
                            foreach ($images as $image): 
                            ?>
                                <div class="project-image <?= $index === 0 ? 'active' : '' ?>">
                                    <img 
                                        src="<?= $image->resize(20, 20)->url() ?>"
                                        srcset="<?= 
                                            $image->srcset([
                                                '400w' => ['width' => 400, 'format' => 'webp'],
                                                '600w' => ['width' => 600, 'format' => 'webp'],
                                                '800w' => ['width' => 800, 'format' => 'webp'],
                                                '1200w' => ['width' => 1200, 'format' => 'webp']
                                            ])
                                        ?>"
                                        loading="lazy"
                                        alt="<?= $projekt->title() ?>"
                                    >
                                </div>
                            <?php 
                            $index++;
                            endforeach; 
                            
                            // Only show navigation arrows if there's more than one image
                            if ($imageCount > 1):
                            ?>
                                <button class="carousel-arrow carousel-arrow-left" aria-label="Previous image">←</button>
                                <button class="carousel-arrow carousel-arrow-right" aria-label="Next image">→</button>
                            <?php endif; ?>
                            
                            <!-- Fullscreen button always available -->
                            <button class="carousel-arrow carousel-fullscreen" aria-label="Fullscreen">
                                <span class="arrow-grid">
                                    <span class="arrow-tl">↖</span>
                                    <span class="arrow-tr">↗</span>
                                    <span class="arrow-bl">↙</span>
                                    <span class="arrow-br">↘</span>
                                </span>
                            </button>
                        </div>
                        <div class="project-text-container text-small">
                            <div class="text-container-white-gradient"></div>
                            <div class="mobile-scroll-gradient"></div>
                            <div class="project-text-content">
                                <div class="project-text"><?= $projekt->text()->kirbytext() ?>
                                    <div class="project-navigation">
                                        <?php if ($hasPrev): ?>
                                            <button class="project-nav-button project-nav-prev button-label">vorheriges Projekt ↑</button>
                                        <?php endif; ?>
                                        <?php if ($hasNext): ?>
                                            <button class="project-nav-button project-nav-next button-label">nächstes Projekt ↓</button>
                                        <?php endif; ?>
                                    </div>
                                </div>
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
            <?php 
            // Get the Pressebilder page
            $pressebilderPage = $site->find('pressebilder');
            if ($pressebilderPage): 
            ?>
                <div class="pressebilder-content offset-element offset-top">
                    <div class="mobile-scroll-gradient"></div>
                    <div class="pressebilder-title button-label"><?= $pressebilderPage->title() ?></div>
                    <?php if ($pressebilderPage->text()->isNotEmpty()): ?>
                        <div class="pressebilder-text text-large content-element hidden"><?= $pressebilderPage->text() ?>
                        </div>
                    <?php endif; ?>
                    <a href="/download-pressebilder.php" class="pressebilder-download text-small content-element hidden" download>hier herunterladen</a>
                    
                    <?php 
                    $images = $pressebilderPage->images();
                    if ($images->isNotEmpty()): 
                    ?>
                        <div class="pressebilder-images content-element hidden">
                            <?php foreach ($images as $image): ?>
                                <div class="pressebild-item">
                                    <img 
                                        src="<?= $image->resize(20, 20)->url() ?>"
                                        srcset="<?= 
                                            $image->srcset([
                                                '400w' => ['width' => 400, 'format' => 'webp'],
                                                '600w' => ['width' => 600, 'format' => 'webp'],
                                                '800w' => ['width' => 800, 'format' => 'webp'],
                                                '1200w' => ['width' => 1200, 'format' => 'webp']
                                            ])
                                        ?>"
                                        loading="lazy"
                                        alt="<?= $image->filename() ?>"
                                    >
                                </div>
                            <?php endforeach; ?>
                        </div>
                    <?php endif; ?>
                </div>
            <?php endif; ?>
        </div>
        
        <div id="inner-scroller-4" class="inner-scroller">
            <?php 
            // Get the Kontakt page
            $kontaktPage = $site->find('kontakt');
            if ($kontaktPage): 
            ?>
                <div class="kontakt-content offset-element offset-top">
                    <div class="mobile-scroll-gradient"></div>
                    <div class="kontakt-title button-label"><?= $kontaktPage->title() ?></div>
                    
                    <div class="kontakt-sections content-element hidden">
                        <div class="kontakt-section kontakt-management">
                            <div class="kontakt-heading text-large bold">Management & Presse</div>
                            <?php if ($kontaktPage->management_name()->isNotEmpty()): ?>
                                <div class="kontakt-field text-small">
                                    <span class="kontakt-value"><?= $kontaktPage->management_name() ?></span>
                                </div>
                            <?php endif; ?>
                            
                            <?php if ($kontaktPage->management_company()->isNotEmpty()): ?>
                                <div class="kontakt-field text-small">
                                    <span class="kontakt-value"><?= $kontaktPage->management_company() ?></span>
                                </div>
                            <?php endif; ?>
                            
                            <?php if ($kontaktPage->management_email()->isNotEmpty()): ?>
                                <div class="kontakt-field text-small">
                                    <a href="mailto:<?= $kontaktPage->management_email() ?>" class="kontakt-value"><?= $kontaktPage->management_email() ?></a>
                                </div>
                            <?php endif; ?>
                        </div>
                        
                    </div>
                </div>
            <?php endif; ?>
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

