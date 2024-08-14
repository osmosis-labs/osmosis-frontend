with import <nixpkgs> {};
mkShell {
  packages = [
    yarn
    nodejs
  ];

  # Enable nix-ld, read here more:
  # https://github.com/Mic92/nix-ld?tab=readme-ov-file#nix-ld
  NIX_LD_LIBRARY_PATH = lib.makeLibraryPath [
    stdenv.cc.cc
    # ...
  ];
  NIX_LD = lib.fileContents "${stdenv.cc}/nix-support/dynamic-linker";
}
