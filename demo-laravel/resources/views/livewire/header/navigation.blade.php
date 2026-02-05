<nav class="app-header__nav" aria-label="Components">
    @foreach($components as $componentItem)
        <a class="app-header__navLink" href="{{ $componentItem['path'] ?? '#'.$componentItem['value'] }}" wire:navigate>
            {{ $componentItem['name'] }}
        </a>
    @endforeach
</nav>
