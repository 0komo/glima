{
  description = "A bridge between Gleam and GJS!";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";
    flakelight.url = "github:nix-community/flakelight";
  };

  outputs = { flakelight, ... }@inputs:
    flakelight ./.
    {
      devShell.packages = pkgs: with pkgs; [
        deno
        gjs
        gleam
      ];
    };
}
