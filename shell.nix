{ pkgs ? import <nixpkgs> {} }:

pkgs.mkShell {
  buildInputs = with pkgs; [
    nodePackages.typescript-language-server
    nodePackages.prettier
    nodejs_24
  ];
}
