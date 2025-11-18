<!-- Fullscreen overlays for all projects -->
<?php 
// Get all project pages (children of the projekte page)
$projektePages = $site->find('projekte');
if ($projektePages && $projektePages->children()->isNotEmpty()): 
    foreach ($projektePages->children() as $projekt): 
        $images = $projekt->images();
        $imageCount = $images->count();
?>
    <div class="fullscreen-overlay">
        <div class="fullscreen-content">
            <?php 
            $index = 0;
            foreach ($images as $image): 
            ?>
                <div class="fullscreen-image <?= $index === 0 ? 'active' : '' ?>">
                    <img src="<?= $image->url() ?>" alt="<?= $projekt->title() ?>">
                </div>
            <?php 
            $index++;
            endforeach; 
            
            // Only show navigation if there's more than one image
            if ($imageCount > 1):
            ?>
                <button class="fullscreen-arrow fullscreen-arrow-left" aria-label="Previous image">←</button>
                <button class="fullscreen-arrow fullscreen-arrow-right" aria-label="Next image">→</button>
            <?php endif; ?>
            <button class="fullscreen-close" aria-label="Close fullscreen">×</button>
        </div>
    </div>
<?php 
    endforeach;
endif; 
?>

