<?php

test('a missing page renders the inertia error page', function () {
    $response = $this->get('/halaman-yang-tidak-ada');

    $response->assertNotFound()
        ->assertInertia(fn ($page) => $page
            ->component('error')
            ->where('status', 404)
        );
});
