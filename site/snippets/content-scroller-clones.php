<!-- Clones for images (masked by SVG) -->
<div class="projects-images-clones-container">
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
    <?php 
        endforeach;
    endif; 
    ?>
</div>

<!-- Clones for text (unmasked, follow originals) -->
<div class="project-text-clones-container">
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

