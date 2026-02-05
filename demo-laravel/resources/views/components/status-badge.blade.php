@props([
    'status' => 'Stable',
])

@php
    $normalized = strtolower($status);
    $variant = match ($normalized) {
        'beta' => 'beta',
        'preview' => 'preview',
        'experimental' => 'preview',
        default => 'stable',
    };
@endphp

<span {{ $attributes->class(['status-badge', "status-badge--{$variant}"]) }}>
    <span class="status-badge__dot" aria-hidden="true"></span>
    <span class="status-badge__label">{{ ucfirst($status) }}</span>
</span>
