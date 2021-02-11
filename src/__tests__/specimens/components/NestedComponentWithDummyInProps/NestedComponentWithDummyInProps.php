<?php
/* NOTICE: Generated file; Do not edit by hand */
use VK\Elephize\Builtins\RenderableComponent;
use VK\Elephize\Builtins\IntrinsicElement;
use VK\Elephize\Builtins\Stdlib;

require_once __DIR__ . '/../DummyComponent/DummyComponent.php';

class NestedComponentWithDummyInProps extends RenderableComponent {
    /**
     * @var NestedComponentWithDummyInProps $_mod
     */
    private static $_mod;
    public static function getInstance(): NestedComponentWithDummyInProps {
        if (!self::$_mod) {
            self::$_mod = new NestedComponentWithDummyInProps();
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
        $_3b2ed12 = [0];
        $count = $_3b2ed12[0];
        $arr = [1, 2, 3];
        return IntrinsicElement::get("div")->render(
            [],
            [
                $props["componentToRender"],
                DummyComponent::getInstance()->render(["count" => $count], []),
                Stdlib::arrayMap1(
                    $arr,
                    /* _b4f3ee1 */ function ($val) use ($count) {
                        return DummyComponent::getInstance()->render(["key" => $val, "count" => $count], []);
                    }
                ),
            ]
        );
    }
}