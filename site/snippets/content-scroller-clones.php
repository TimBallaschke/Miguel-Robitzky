<!-- Clones for images (masked by SVG) -->
<div class="projects-images-clones-container hidden">
    <?php 
    // Get all project pages (children of the projekte page)
    $projektePages = $site->find('projekte');
    if ($projektePages && $projektePages->children()->isNotEmpty()): 
        foreach ($projektePages->children() as $projekt): 
    ?>
        <div class="projects-images projects-images-clone">
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
    <?php 
        endforeach;
    endif; 
    ?>
</div>

<!-- Clones for text (unmasked, follow originals) -->
<div class="project-text-clones-container hidden">
    <?php 
    // Get all project pages again for text clones
    if ($projektePages && $projektePages->children()->isNotEmpty()): 
        $allProjects = $projektePages->children();
        $totalProjects = $allProjects->count();
        $currentIndex = 0;
        foreach ($allProjects as $projekt): 
            $hasPrev = $currentIndex > 0;
            $hasNext = $currentIndex < ($totalProjects - 1);
            $currentIndex++;
    ?>
        <div class="project-text-container project-text-clone text-small">
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
    <?php 
        endforeach;
    endif; 
    ?>
</div>

<!-- Unmasked clone for FIRST image of FIRST project only (always visible, desktop only) -->
<div class="projects-images-unmasked-container hidden desktop-only">
    <?php 
    // Clone only the first project
    if ($projektePages && $projektePages->children()->isNotEmpty()): 
        $firstProject = $projektePages->children()->first();
        if ($firstProject):
            $firstImage = $firstProject->images()->first();
            if ($firstImage):
    ?>
        <div class="projects-images projects-images-unmasked-clone">
            <div class="project-header offset-element offset-top">
                <div class="projects-title button-label"><?= $projektePages->title() ?></div>
                <div class="project-title text-large bold"><?= $firstProject->title() ?></div>
            </div>
            <!-- Only the first image -->
            <div class="project-image active">
                <img 
                    src="<?= $firstImage->resize(20, 20)->url() ?>"
                    srcset="<?= 
                        $firstImage->srcset([
                            '400w' => ['width' => 400, 'format' => 'webp'],
                            '600w' => ['width' => 600, 'format' => 'webp'],
                            '800w' => ['width' => 800, 'format' => 'webp'],
                            '1200w' => ['width' => 1200, 'format' => 'webp']
                        ])
                    ?>"
                    loading="lazy"
                    alt="<?= $firstProject->title() ?>"
                >
            </div>
        </div>
    <?php 
            endif;
        endif;
    endif; 
    ?>
</div>

