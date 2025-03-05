import { checkCollision } from '../utils/collision.js';

export function createProjectile(scene, game, position, direction, weapon, isEnemy) {
    // Create projectile physics object
    const projectile = {
        position: position.clone(),
        velocity: direction.clone().normalize().multiplyScalar(0.4),
        size: 0.3,
        damage: weapon.damage,
        range: weapon.range,
        distanceTraveled: 0,
        isEnemy: isEnemy
    };
    
    // Create projectile 3D model
    const geometry = new THREE.SphereGeometry(projectile.size / 2, 8, 8);
    const material = new THREE.MeshLambertMaterial({ 
        color: isEnemy ? game.colors.ENEMY : game.colors.PROJECTILE 
    });
    const projectileModel = new THREE.Mesh(geometry, material);
    projectileModel.position.copy(projectile.position);
    scene.add(projectileModel);
    
    // Store mesh reference
    projectile.mesh = projectileModel;
    
    // Add to projectiles array
    game.projectiles.push(projectile);
}

export function updateProjectiles(game) {
    for (let i = game.projectiles.length - 1; i >= 0; i--) {
        const projectile = game.projectiles[i];
        
        // Update position
        projectile.position.add(projectile.velocity);
        projectile.distanceTraveled += projectile.velocity.length();
        
        // Update mesh
        projectile.mesh.position.copy(projectile.position);
        
        // Check for max range
        if (projectile.distanceTraveled > projectile.range) {
            game.scene.remove(projectile.mesh);
            game.projectiles.splice(i, 1);
            continue;
        }
        
        // Check for collisions with obstacles
        if (checkCollision(projectile.position, projectile.size, game.obstacles)) {
            game.scene.remove(projectile.mesh);
            game.projectiles.splice(i, 1);
            continue;
        }
        
        // Check for collisions with enemies or player
        if (projectile.isEnemy) {
            // Enemy projectile hitting player
            const distance = projectile.position.distanceTo(game.player.position);
            if (distance < (projectile.size + game.player.size) / 2) {
                game.player.damage(projectile.damage);
                game.scene.remove(projectile.mesh);
                game.projectiles.splice(i, 1);
            }
        } else {
            // Player projectile hitting enemies
            for (let j = 0; j < game.enemies.length; j++) {
                const enemy = game.enemies[j];
                const distance = projectile.position.distanceTo(enemy.position);
                if (distance < (projectile.size + enemy.size) / 2) {
                    enemy.damage(projectile.damage);
                    game.scene.remove(projectile.mesh);
                    game.projectiles.splice(i, 1);
                    break;
                }
            }
        }
    }
} 