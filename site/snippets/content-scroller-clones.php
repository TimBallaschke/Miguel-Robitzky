<!-- Clones for images (masked by SVG) -->
<div class="projects-images-clones-container hidden">
    <?php 
    // Get all project pages (children of the projekte page)
    $projektePages = $site->find('projekte');
    if ($projektePages && $projektePages->children()->isNotEmpty()): 
        foreach ($projektePages->children() as $projekt): 
    ?>
        <div class="projects-images projects-images-clone">
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
                <button class="carousel-arrow carousel-fullscreen" aria-label="Fullscreen">
                    <span class="arrow-grid">
                        <span class="arrow-tl">↖</span>
                        <span class="arrow-tr">↗</span>
                        <span class="arrow-bl">↙</span>
                        <span class="arrow-br">↘</span>
                    </span>
                </button>
            <?php endif; ?>
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
        foreach ($projektePages->children() as $projekt): 
    ?>
        <div class="project-text-container project-text-clone">
            <div class="text-container-white-gradient"></div>
            <div class="project-text-content">
                <div class="project-text"><?= $projekt->text() ?></div>
            </div>
        </div>
    <?php 
        endforeach;
    endif; 
    ?>
</div>

