#!/bin/bash

# ========================================
# Vim Setup Script for CentOS
# ========================================

echo "Setting up Vim configuration for CentOS..."

# Create necessary directories
echo "Creating Vim directories..."
mkdir -p ~/.vim/backup
mkdir -p ~/.vim/swap
mkdir -p ~/.vim/undo
mkdir -p ~/.vim/autoload
mkdir -p ~/.vim/plugged

# Set proper permissions
chmod 755 ~/.vim
chmod 755 ~/.vim/backup
chmod 755 ~/.vim/swap
chmod 755 ~/.vim/undo
chmod 755 ~/.vim/autoload
chmod 755 ~/.vim/plugged

# Install pathogen if not exists
if [ ! -f ~/.vim/autoload/pathogen.vim ]; then
    echo "Installing pathogen..."
    curl -LSso ~/.vim/autoload/pathogen.vim https://tpo.pe/pathogen.vim
fi

# Install vim-plug if not exists
if [ ! -f ~/.vim/autoload/plug.vim ]; then
    echo "Installing vim-plug..."
    curl -fLo ~/.vim/autoload/plug.vim --create-dirs https://raw.githubusercontent.com/junegunn/vim-plug/master/plug.vim
fi

# Copy vimrc if it doesn't exist
if [ ! -f ~/.vimrc ]; then
    echo "Installing .vimrc..."
    cp .vimrc ~/.vimrc
else
    echo "Backing up existing .vimrc to .vimrc.backup"
    cp ~/.vimrc ~/.vimrc.backup
    cp .vimrc ~/.vimrc
fi

# Install vim packages if available
if command -v yum &> /dev/null; then
    echo "Installing Vim packages via yum..."
    sudo yum install -y vim-enhanced vim-common
elif command -v dnf &> /dev/null; then
    echo "Installing Vim packages via dnf..."
    sudo dnf install -y vim-enhanced vim-common
elif command -v apt-get &> /dev/null; then
    echo "Installing Vim packages via apt-get..."
    sudo apt-get update
    sudo apt-get install -y vim
fi

# Install additional useful packages
echo "Installing additional useful packages..."
if command -v yum &> /dev/null; then
    sudo yum install -y git curl wget
elif command -v dnf &> /dev/null; then
    sudo dnf install -y git curl wget
elif command -v apt-get &> /dev/null; then
    sudo apt-get install -y git curl wget
fi

echo ""
echo "========================================"
echo "Vim setup completed successfully!"
echo "========================================"
echo ""
echo "Features installed:"
echo "✓ Enhanced Vim configuration"
echo "✓ Pathogen plugin manager"
echo "✓ Vim-plug plugin manager"
echo "✓ Backup directories created"
echo "✓ Useful key mappings"
echo "✓ File type specific settings"
echo "✓ Auto commands"
echo ""
echo "To use:"
echo "1. Open vim: vim filename"
echo "2. Use leader key ',' for shortcuts"
echo "3. Install plugins with :PlugInstall"
echo ""
echo "Common shortcuts:"
echo "  ,w  - Save file"
echo "  ,q  - Quit"
echo "  ,x  - Save and quit"
echo "  ,h  - Clear search highlight"
echo "  ,n  - Toggle line numbers"
echo "  ,p  - Toggle paste mode"
echo "  ,t  - New tab"
echo "  ,s  - Split window"
echo "  ,v  - Vertical split"
echo ""
echo "Happy coding! 🚀"
