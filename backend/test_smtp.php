<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\Password;

echo "Testing Password::sendResetLink for nguyentranminhnho123@gmail.com...\n";

try {
    $status = Password::sendResetLink(['email' => 'nguyentranminhnho123@gmail.com']);
    echo "Status: $status\n";
    echo "Expected RESET_LINK_SENT = " . Password::RESET_LINK_SENT . "\n";
    echo "Match: " . ($status === Password::RESET_LINK_SENT ? 'YES' : 'NO') . "\n";
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
    echo "Class: " . get_class($e) . "\n";
}
