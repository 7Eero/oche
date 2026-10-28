{
  description = "Darts Tracker – Next.js dev environment";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs { inherit system; };
      in
      {
        devShells.default = pkgs.mkShell {
          buildInputs = with pkgs; [
            nodejs_22
            typescript
            typescript-language-server
          ];

          shellHook = ''
            export PATH="$PWD/node_modules/.bin:$PATH"
            echo "🎯 Darts Tracker dev environment loaded!"
          '';
        };
      });
}
