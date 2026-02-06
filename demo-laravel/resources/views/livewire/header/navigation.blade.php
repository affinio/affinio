<nav class="app-header__nav" aria-label="Components">
    @foreach($components as $componentItem)
        @php
            $path = $componentItem['path'] ?? '#'.$componentItem['value'];
            $currentPath = '/'.ltrim(request()->path(), '/');
            $isActive = str_starts_with($path, '/') && $currentPath === $path;
        @endphp
        <a
            @class([
                'app-header__navLink',
                'app-header__navLink--active' => $isActive,
            ])
            href="{{ $path }}"
            @if($isActive) aria-current="page" @endif
            wire:navigate
        >
            <span class="app-header__navDot" aria-hidden="true"></span>
            {{ $componentItem['name'] }}
        </a>
    @endforeach
</nav>
