<?php
/* NOTICE: autogenerated file; Do not edit by hand */
namespace specimens\misc;
use VK\Elephize\Builtins\Stdlib;
use VK\Elephize\Builtins\CJSModule;

class ToReplaceModule extends CJSModule {
    /**
     * @var ToReplaceModule $_mod
     */
    private static $_mod;
    public static function getInstance(): ToReplaceModule {
        if (!self::$_mod) {
            self::$_mod = new ToReplaceModule();
        }
        return self::$_mod;
    }

    /**
     * @param string $test
     * @return string
     */
    public function getLang($test) {
        return "" . $test;
    }
    /**
     * @param string $test
     * @return string
     */
    public function getLangStatic($test) {
        return "" . $test;
    }

    private function __construct() {
    }
}
