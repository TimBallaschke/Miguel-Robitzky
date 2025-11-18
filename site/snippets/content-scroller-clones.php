<!-- Clones for images (masked by SVG) -->
<div class="projects-images-clones-container hidden">
    <?php 
    // Get all project pages (children of the projekte page)
    $projektePages = $site->find('projekte');
    if ($projektePages && $projektePages->children()->isNotEmpty()): 
        foreach ($projektePages->children() as $projekt): 
    ?>
        <div class="projects-images projects-images-clone">
            <div class="project-header offset-top">
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
                    <img src="<?= $image->url() ?>" alt="<?= $projekt->title() ?>">
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
            <div class="project-text-content">
                <div class="project-text"><?= $projekt->text() ?>
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

