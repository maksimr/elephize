<?php
/* NOTICE: Generated file; Do not edit by hand */
use VK\Elephize\Builtins\RenderableComponent;
use VK\Elephize\Builtins\IntrinsicElement;
use VK\Elephize\Builtins\Stdlib;

class TypedComponent extends RenderableComponent {
    /**
     * @var TypedComponent $_mod
     */
    private static $_mod;
    public static function getInstance(): TypedComponent {
        if (!self::$_mod) {
            self::$_mod = new TypedComponent();
        }
        return self::$_mod;
    }

    private function __construct() {
    }

    /**
     * @param array $props
     * @param array $children
     * @return string
     */
    public function render(array $props, array $children) {
        $classes = $props["classes"];
        return IntrinsicElement::get("div")->render(["className" => $classes], [$children]);
    }
}
