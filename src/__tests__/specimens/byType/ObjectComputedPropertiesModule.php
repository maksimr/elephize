<?php
/* NOTICE: Generated file; Do not edit by hand */
use VK\Elephize\Builtins\Stdlib;
use VK\Elephize\Builtins\CJSModule;

class ObjectComputedPropertiesModule extends CJSModule {
    /**
     * @var ObjectComputedPropertiesModule $_mod
     */
    private static $_mod;
    public static function getInstance(): ObjectComputedPropertiesModule {
        if (!self::$_mod) {
            self::$_mod = new ObjectComputedPropertiesModule();
        }
        return self::$_mod;
    }

    /**
     * @var string $ocp_prop
     */
    public $ocp_prop;
    /**
     * @var array $ocp1
     */
    public $ocp1;

    private function __construct() {
        $this->ocp_prop = "sdf";
        $this->ocp1 = [
            "a" => 123,
            $this->ocp_prop . "__asd" => 321,
            "c" => 222,
            "d" => "123",
        ];
        \VK\Elephize\Builtins\Console::log($this->ocp1);
    }
}
