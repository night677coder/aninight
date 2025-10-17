"use client"
import React, { useState, useEffect, useRef } from 'react'
import { Switch, cn } from "@nextui-org/react";
import { useSettings } from '../../lib/store';
import { useStore } from "zustand";
import styles from './SettingsPage.module.css';

const SwitchSetting = ({ value, onValueChange }) => {
    return (
        <Switch
            isSelected={value}
            onValueChange={(newValue) => onValueChange(newValue)}
            classNames={{
                base: cn(
                    "inline-flex flex-row-reverse w-full bg-none hover:bg-none items-center",
                    "justify-between cursor-pointer rounded-lg gap-2 border-none border-transparent",
                ),
                wrapper: "p-0 h-5 overflow-visible bg-[#333]",
                thumb: cn("w-5 h-5 border-2 shadow-lg bg-white",
                    "group-data-[hover=true]:border-white",
                    "group-data-[selected=true]:ml-6 group-data-[selected=true]:bg-white",
                    "group-data-[pressed=true]:w-6",
                    "group-data-[selected]:group-data-[pressed]:ml-5",
                ),
            }}
        />
    );
};

function SettingsPage() {
    const settings = useStore(useSettings, (state) => state.settings);
    const [activeTab, setActiveTab] = useState('interface');
    const [customBgColor, setCustomBgColor] = useState(settings.customBgColor || '#000000');
    const [customAccentColor, setCustomAccentColor] = useState(settings.customAccentColor || '#ffffff');
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [showAccentPicker, setShowAccentPicker] = useState(false);
    const [bgImage, setBgImage] = useState(settings.bgImage || '');
    const [bgImageOpacity, setBgImageOpacity] = useState(settings.bgImageOpacity || 0.3);
    const [homeSections, setHomeSections] = useState(settings.homeSections || [
        { id: 'greeting', label: 'Greeting', enabled: true },
        { id: 'continueWatching', label: 'Continue Watching', enabled: true },
        { id: 'continueReading', label: 'Continue Reading', enabled: true },
        { id: 'currentlyAiring', label: 'Currently Airing', enabled: true },
        { id: 'premiumShowcase', label: 'Premium Collection', enabled: true },
        { id: 'news', label: 'News', enabled: true },
        { id: 'topRated', label: 'Top Rated', enabled: true },
        { id: 'randomRecs', label: 'Random Recommendations', enabled: true },
        { id: 'upcoming', label: 'Upcoming Anime', enabled: true },
        { id: 'genre', label: 'Genre Section', enabled: true },
        { id: 'recentlyUpdated', label: 'Recently Updated', enabled: true },
        { id: 'popularManga', label: 'Popular Manga', enabled: true }
    ]);
    const [draggedItem, setDraggedItem] = useState(null);
    const fileInputRef = useRef(null);

    const handleBgColorChange = (color) => {
        setCustomBgColor(color);
        useSettings.setState({ 
            settings: { 
                ...useSettings.getState().settings, 
                customBgColor: color 
            } 
        });
        localStorage.setItem('custom-bg-color', color);
    };

    const handleAccentColorChange = (color) => {
        setCustomAccentColor(color);
        useSettings.setState({ 
            settings: { 
                ...useSettings.getState().settings, 
                customAccentColor: color 
            } 
        });
        localStorage.setItem('custom-accent-color', color);
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const imageData = reader.result;
                setBgImage(imageData);
                useSettings.setState({ 
                    settings: { 
                        ...useSettings.getState().settings, 
                        bgImage: imageData 
                    } 
                });
                localStorage.setItem('bg-image', imageData);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveImage = () => {
        setBgImage('');
        useSettings.setState({ 
            settings: { 
                ...useSettings.getState().settings, 
                bgImage: '' 
            } 
        });
        localStorage.removeItem('bg-image');
    };

    const handleOpacityChange = (opacity) => {
        setBgImageOpacity(opacity);
        useSettings.setState({ 
            settings: { 
                ...useSettings.getState().settings, 
                bgImageOpacity: opacity 
            } 
        });
        localStorage.setItem('bg-image-opacity', opacity);
    };

    const handleDragStart = (index) => {
        setDraggedItem(index);
    };

    const handleDragOver = (e, index) => {
        e.preventDefault();
        if (draggedItem === null || draggedItem === index) return;

        const newSections = [...homeSections];
        const draggedSection = newSections[draggedItem];
        newSections.splice(draggedItem, 1);
        newSections.splice(index, 0, draggedSection);
        
        setHomeSections(newSections);
        setDraggedItem(index);
    };

    const handleDragEnd = () => {
        setDraggedItem(null);
        useSettings.setState({ 
            settings: { 
                ...useSettings.getState().settings, 
                homeSections: homeSections 
            } 
        });
        localStorage.setItem('home-sections', JSON.stringify(homeSections));
    };

    const toggleSection = (index) => {
        const newSections = [...homeSections];
        newSections[index].enabled = !newSections[index].enabled;
        setHomeSections(newSections);
        useSettings.setState({ 
            settings: { 
                ...useSettings.getState().settings, 
                homeSections: newSections 
            } 
        });
        localStorage.setItem('home-sections', JSON.stringify(newSections));
    };



    const tabs = [
        { id: 'interface', label: 'User Interface', icon: '⚙️' },
        { id: 'playback', label: 'Playback', icon: '▶️' },
        { id: 'appearance', label: 'Appearance', icon: '🎨' },
        { id: 'layout', label: 'Layout', icon: '📐' },
        { id: 'advanced', label: 'Advanced', icon: '⚡' }
    ];

    return (
        <div className={styles.container} style={{ backgroundColor: customBgColor }}>
            {/* Sidebar */}
            <div className={styles.sidebar}>
                <div className={styles.sidebarHeader}>
                    <div className={styles.logo}>
                        <div className={styles.logoIcon}>S</div>
                    </div>
                    <h2 className={styles.sidebarTitle}>Settings</h2>
                    <p className={styles.sidebarSubtitle}>Customize your experience</p>
                </div>

                <nav className={styles.nav}>
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`${styles.navItem} ${activeTab === tab.id ? styles.navItemActive : ''}`}
                        >
                            <span className={styles.navIcon}>{tab.icon}</span>
                            <span className={styles.navLabel}>{tab.label}</span>
                        </button>
                    ))}
                </nav>
            </div>

            {/* Main Content */}
            <div className={styles.mainContent}>
                <div className={styles.contentHeader}>
                    <h1 className={styles.contentTitle}>
                        {tabs.find(t => t.id === activeTab)?.label}
                    </h1>
                    <p className={styles.contentSubtitle}>
                        {activeTab === 'interface' && 'Customize the user interface'}
                        {activeTab === 'playback' && 'Configure playback settings'}
                        {activeTab === 'appearance' && 'Personalize your theme and colors'}
                        {activeTab === 'layout' && 'Organize homepage sections'}
                        {activeTab === 'advanced' && 'Advanced configuration options'}
                    </p>
                </div>

                <div className={styles.settingsGrid}>
                    {/* Interface Tab */}
                    {activeTab === 'interface' && (
                        <>
                            <div className={styles.settingCard}>
                                <div className={styles.settingHeader}>
                                    <div>
                                        <h3 className={styles.settingTitle}>Homepage Trailer</h3>
                                        <p className={styles.settingDesc}>Play trailer on homepage hero section</p>
                                    </div>
                                    <SwitchSetting
                                        value={settings.herotrailer}
                                        onValueChange={(value) => useSettings.setState({ settings: { ...useSettings.getState().settings, herotrailer: value } })}
                                    />
                                </div>
                            </div>

                            <div className={styles.settingCard}>
                                <div className={styles.settingHeader}>
                                    <div>
                                        <h3 className={styles.settingTitle}>Details Page Trailer</h3>
                                        <p className={styles.settingDesc}>Play trailer in anime details banner</p>
                                    </div>
                                    <SwitchSetting
                                        value={settings.bannertrailer}
                                        onValueChange={(value) => useSettings.setState({ settings: { ...useSettings.getState().settings, bannertrailer: value } })}
                                    />
                                </div>
                            </div>

                            <div className={styles.settingCard}>
                                <div className={styles.settingHeader}>
                                    <div>
                                        <h3 className={styles.settingTitle}>Unmute Trailer Audio</h3>
                                        <p className={styles.settingDesc}>Enable audio for trailers (muted by default)</p>
                                    </div>
                                    <SwitchSetting
                                        value={settings.audio}
                                        onValueChange={(value) => useSettings.setState({ settings: { ...useSettings.getState().settings, audio: value } })}
                                    />
                                </div>
                            </div>

                            <div className={styles.settingCard}>
                                <div className={styles.settingHeader}>
                                    <div>
                                        <h3 className={styles.settingTitle}>Smooth Scrolling</h3>
                                        <p className={styles.settingDesc}>Enable smooth scrolling animations</p>
                                    </div>
                                    <SwitchSetting
                                        value={settings.smoothScroll || false}
                                        onValueChange={(value) => useSettings.setState({ settings: { ...useSettings.getState().settings, smoothScroll: value } })}
                                    />
                                </div>
                            </div>

                            <div className={styles.settingCard}>
                                <div className={styles.settingHeader}>
                                    <div>
                                        <h3 className={styles.settingTitle}>Compact Mode</h3>
                                        <p className={styles.settingDesc}>Reduce spacing for more content</p>
                                    </div>
                                    <SwitchSetting
                                        value={settings.compactMode || false}
                                        onValueChange={(value) => useSettings.setState({ settings: { ...useSettings.getState().settings, compactMode: value } })}
                                    />
                                </div>
                            </div>
                        </>
                    )}

                    {/* Playback Tab */}
                    {activeTab === 'playback' && (
                        <>
                            <div className={styles.settingCard}>
                                <div className={styles.settingHeader}>
                                    <div>
                                        <h3 className={styles.settingTitle}>AutoPlay Video</h3>
                                        <p className={styles.settingDesc}>Automatically start playing when video loads</p>
                                    </div>
                                    <SwitchSetting
                                        value={settings.autoplay}
                                        onValueChange={(value) => useSettings.setState({ settings: { ...useSettings.getState().settings, autoplay: value } })}
                                    />
                                </div>
                            </div>

                            <div className={styles.settingCard}>
                                <div className={styles.settingHeader}>
                                    <div>
                                        <h3 className={styles.settingTitle}>AutoNext Episode</h3>
                                        <p className={styles.settingDesc}>Automatically play next episode when current ends</p>
                                    </div>
                                    <SwitchSetting
                                        value={settings.autonext}
                                        onValueChange={(value) => useSettings.setState({ settings: { ...useSettings.getState().settings, autonext: value } })}
                                    />
                                </div>
                            </div>

                            <div className={styles.settingCard}>
                                <div className={styles.settingHeader}>
                                    <div>
                                        <h3 className={styles.settingTitle}>AutoSkip Intro/Outro</h3>
                                        <p className={styles.settingDesc}>Skip intros and outros automatically</p>
                                    </div>
                                    <SwitchSetting
                                        value={settings.autoskip}
                                        onValueChange={(value) => useSettings.setState({ settings: { ...useSettings.getState().settings, autoskip: value } })}
                                    />
                                </div>
                            </div>



                            <div className={`${styles.settingCard} ${styles.settingCardLarge}`}>
                                <h3 className={styles.settingTitle}>Video Loading Strategy</h3>
                                <p className={styles.settingDesc}>Control when videos start loading</p>
                                
                                <div className={styles.optionsList}>
                                    <div className={`${styles.optionItem} ${settings.load === 'idle' ? styles.optionItemActive : ''}`}>
                                        <div className={styles.optionContent}>
                                            <div className={styles.optionBadge}>1</div>
                                            <div>
                                                <h4 className={styles.optionTitle}>Idle</h4>
                                                <p className={styles.optionDesc}>Load after page completes (Recommended)</p>
                                            </div>
                                        </div>
                                        <SwitchSetting
                                            value={settings.load === 'idle'}
                                            onValueChange={(value) => value && useSettings.setState({ settings: { ...useSettings.getState().settings, load: 'idle' } })}
                                        />
                                    </div>

                                    <div className={`${styles.optionItem} ${settings.load === 'visible' ? styles.optionItemActive : ''}`}>
                                        <div className={styles.optionContent}>
                                            <div className={styles.optionBadge}>2</div>
                                            <div>
                                                <h4 className={styles.optionTitle}>Visible</h4>
                                                <p className={styles.optionDesc}>Load when visible on screen</p>
                                            </div>
                                        </div>
                                        <SwitchSetting
                                            value={settings.load === 'visible'}
                                            onValueChange={(value) => value && useSettings.setState({ settings: { ...useSettings.getState().settings, load: 'visible' } })}
                                        />
                                    </div>

                                    <div className={`${styles.optionItem} ${settings.load === 'eager' ? styles.optionItemActive : ''}`}>
                                        <div className={styles.optionContent}>
                                            <div className={styles.optionBadge}>3</div>
                                            <div>
                                                <h4 className={styles.optionTitle}>Eager</h4>
                                                <p className={styles.optionDesc}>Load immediately (High bandwidth)</p>
                                            </div>
                                        </div>
                                        <SwitchSetting
                                            value={settings.load === 'eager'}
                                            onValueChange={(value) => value && useSettings.setState({ settings: { ...useSettings.getState().settings, load: 'eager' } })}
                                        />
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Appearance Tab */}
                    {activeTab === 'appearance' && (
                        <>
                            <div className={`${styles.settingCard} ${styles.settingCardLarge}`}>
                                <h3 className={styles.settingTitle}>Background Image</h3>
                                <p className={styles.settingDesc}>Upload a custom background image</p>
                                
                                <div className={styles.imageUploadContainer}>
                                    {bgImage ? (
                                        <div className={styles.imagePreview}>
                                            <img src={bgImage} alt="Background" className={styles.previewImage} />
                                            <div className={styles.imageControls}>
                                                <button onClick={handleRemoveImage} className={styles.removeButton}>
                                                    Remove Image
                                                </button>
                                                <div className={styles.opacityControl}>
                                                    <label className={styles.opacityLabel}>
                                                        Opacity: {Math.round(bgImageOpacity * 100)}%
                                                    </label>
                                                    <input 
                                                        type="range" 
                                                        min="0" 
                                                        max="1" 
                                                        step="0.05"
                                                        value={bgImageOpacity}
                                                        onChange={(e) => handleOpacityChange(parseFloat(e.target.value))}
                                                        className={styles.opacitySlider}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div 
                                            className={styles.uploadArea}
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            <div className={styles.uploadIcon}>📁</div>
                                            <p className={styles.uploadText}>Click to upload background image</p>
                                            <p className={styles.uploadHint}>PNG, JPG, GIF up to 10MB</p>
                                        </div>
                                    )}
                                    <input 
                                        ref={fileInputRef}
                                        type="file" 
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className={styles.fileInput}
                                    />
                                </div>
                            </div>

                            <div className={`${styles.settingCard} ${styles.settingCardLarge}`}>
                                <h3 className={styles.settingTitle}>Background Color</h3>
                                <p className={styles.settingDesc}>Choose any color for your background</p>
                                
                                <div className={styles.colorPickerContainer}>
                                    <div className={styles.colorPreview} style={{ backgroundColor: customBgColor }} onClick={() => setShowColorPicker(!showColorPicker)}>
                                        <span className={styles.colorValue}>{customBgColor}</span>
                                    </div>
                                    {showColorPicker && (
                                        <div className={styles.colorPicker}>
                                            <div className={styles.colorInputWrapper}>
                                                <input 
                                                    type="color" 
                                                    value={customBgColor} 
                                                    onChange={(e) => handleBgColorChange(e.target.value)}
                                                    className={styles.colorInput}
                                                />
                                                <input 
                                                    type="text" 
                                                    value={customBgColor} 
                                                    onChange={(e) => handleBgColorChange(e.target.value)}
                                                    className={styles.colorTextInput}
                                                    placeholder="#000000"
                                                />
                                            </div>
                                            <p className={styles.colorPickerLabel}>Presets</p>
                                            <div className={styles.presetColors}>
                                                {['#000000', '#0a0a0a', '#111111', '#1a1a1a', '#222222', '#1a1a2e', '#16213e', '#0f3460', '#1e3a5f', '#2c3e50'].map(color => (
                                                    <button
                                                        key={color}
                                                        className={styles.presetColor}
                                                        style={{ backgroundColor: color }}
                                                        onClick={() => handleBgColorChange(color)}
                                                        title={color}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className={`${styles.settingCard} ${styles.settingCardLarge}`}>
                                <h3 className={styles.settingTitle}>Accent Color</h3>
                                <p className={styles.settingDesc}>Choose any color for accents and highlights</p>
                                
                                <div className={styles.colorPickerContainer}>
                                    <div className={styles.colorPreview} style={{ backgroundColor: customAccentColor }} onClick={() => setShowAccentPicker(!showAccentPicker)}>
                                        <span className={styles.colorValue}>{customAccentColor}</span>
                                    </div>
                                    {showAccentPicker && (
                                        <div className={styles.colorPicker}>
                                            <div className={styles.colorInputWrapper}>
                                                <input 
                                                    type="color" 
                                                    value={customAccentColor} 
                                                    onChange={(e) => handleAccentColorChange(e.target.value)}
                                                    className={styles.colorInput}
                                                />
                                                <input 
                                                    type="text" 
                                                    value={customAccentColor} 
                                                    onChange={(e) => handleAccentColorChange(e.target.value)}
                                                    className={styles.colorTextInput}
                                                    placeholder="#ffffff"
                                                />
                                            </div>
                                            <p className={styles.colorPickerLabel}>Presets</p>
                                            <div className={styles.presetColors}>
                                                {['#ffffff', '#f0f0f0', '#e0e0e0', '#d0d0d0', '#c0c0c0', '#3498db', '#e74c3c', '#2ecc71', '#f39c12', '#9b59b6'].map(color => (
                                                    <button
                                                        key={color}
                                                        className={styles.presetColor}
                                                        style={{ backgroundColor: color }}
                                                        onClick={() => handleAccentColorChange(color)}
                                                        title={color}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className={styles.settingCard}>
                                <div className={styles.settingHeader}>
                                    <div>
                                        <h3 className={styles.settingTitle}>Blur Effects</h3>
                                        <p className={styles.settingDesc}>Enable glassmorphism effects</p>
                                    </div>
                                    <SwitchSetting
                                        value={settings.blurEffects || false}
                                        onValueChange={(value) => useSettings.setState({ settings: { ...useSettings.getState().settings, blurEffects: value } })}
                                    />
                                </div>
                            </div>

                            <div className={styles.settingCard}>
                                <div className={styles.settingHeader}>
                                    <div>
                                        <h3 className={styles.settingTitle}>Animations</h3>
                                        <p className={styles.settingDesc}>Enable UI animations and transitions</p>
                                    </div>
                                    <SwitchSetting
                                        value={settings.animations !== false}
                                        onValueChange={(value) => useSettings.setState({ settings: { ...useSettings.getState().settings, animations: value } })}
                                    />
                                </div>
                            </div>

                            <div className={styles.settingCard}>
                                <div className={styles.settingHeader}>
                                    <div>
                                        <h3 className={styles.settingTitle}>Card Hover Effects</h3>
                                        <p className={styles.settingDesc}>Animate cards on hover</p>
                                    </div>
                                    <SwitchSetting
                                        value={settings.cardHover !== false}
                                        onValueChange={(value) => useSettings.setState({ settings: { ...useSettings.getState().settings, cardHover: value } })}
                                    />
                                </div>
                            </div>
                        </>
                    )}

                    {/* Layout Tab */}
                    {activeTab === 'layout' && (
                        <>
                            <div className={`${styles.settingCard} ${styles.settingCardFull}`}>
                                <h3 className={styles.settingTitle}>Homepage Sections</h3>
                                <p className={styles.settingDesc}>Drag to reorder, toggle to show/hide sections</p>
                                
                                <div className={styles.sectionsContainer}>
                                    {homeSections.map((section, index) => (
                                        <div
                                            key={section.id}
                                            draggable
                                            onDragStart={() => handleDragStart(index)}
                                            onDragOver={(e) => handleDragOver(e, index)}
                                            onDragEnd={handleDragEnd}
                                            className={`${styles.sectionItem} ${draggedItem === index ? styles.dragging : ''} ${!section.enabled ? styles.disabled : ''}`}
                                        >
                                            <div className={styles.sectionLeft}>
                                                <div className={styles.dragHandle}>
                                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                                                        <circle cx="7" cy="5" r="1.5"/>
                                                        <circle cx="13" cy="5" r="1.5"/>
                                                        <circle cx="7" cy="10" r="1.5"/>
                                                        <circle cx="13" cy="10" r="1.5"/>
                                                        <circle cx="7" cy="15" r="1.5"/>
                                                        <circle cx="13" cy="15" r="1.5"/>
                                                    </svg>
                                                </div>
                                                <div className={styles.sectionInfo}>
                                                    <span className={styles.sectionNumber}>{index + 1}</span>
                                                    <span className={styles.sectionLabel}>{section.label}</span>
                                                </div>
                                            </div>
                                            <SwitchSetting
                                                value={section.enabled}
                                                onValueChange={() => toggleSection(index)}
                                            />
                                        </div>
                                    ))}
                                </div>
                                
                                <div className={styles.layoutHint}>
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                        <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0zM7 4v1h2V4H7zm0 2v6h2V6H7z"/>
                                    </svg>
                                    <span>Changes apply immediately. Disabled sections won't appear on homepage.</span>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Advanced Tab */}
                    {activeTab === 'advanced' && (
                        <>
                            <div className={styles.settingCard}>
                                <div className={styles.settingHeader}>
                                    <div>
                                        <h3 className={styles.settingTitle}>Hardware Acceleration</h3>
                                        <p className={styles.settingDesc}>Use GPU for better performance</p>
                                    </div>
                                    <SwitchSetting
                                        value={settings.hwAccel !== false}
                                        onValueChange={(value) => useSettings.setState({ settings: { ...useSettings.getState().settings, hwAccel: value } })}
                                    />
                                </div>
                            </div>

                            <div className={styles.settingCard}>
                                <div className={styles.settingHeader}>
                                    <div>
                                        <h3 className={styles.settingTitle}>Preload Images</h3>
                                        <p className={styles.settingDesc}>Preload images for faster loading</p>
                                    </div>
                                    <SwitchSetting
                                        value={settings.preloadImages !== false}
                                        onValueChange={(value) => useSettings.setState({ settings: { ...useSettings.getState().settings, preloadImages: value } })}
                                    />
                                </div>
                            </div>

                            <div className={styles.settingCard}>
                                <div className={styles.settingHeader}>
                                    <div>
                                        <h3 className={styles.settingTitle}>Debug Mode</h3>
                                        <p className={styles.settingDesc}>Show debug information</p>
                                    </div>
                                    <SwitchSetting
                                        value={settings.debugMode || false}
                                        onValueChange={(value) => useSettings.setState({ settings: { ...useSettings.getState().settings, debugMode: value } })}
                                    />
                                </div>
                            </div>

                            <div className={styles.settingCard}>
                                <div className={styles.settingHeader}>
                                    <div>
                                        <h3 className={styles.settingTitle}>Analytics</h3>
                                        <p className={styles.settingDesc}>Help improve the app with usage data</p>
                                    </div>
                                    <SwitchSetting
                                        value={settings.analytics !== false}
                                        onValueChange={(value) => useSettings.setState({ settings: { ...useSettings.getState().settings, analytics: value } })}
                                    />
                                </div>
                            </div>

                            <div className={`${styles.settingCard} ${styles.dangerCard}`}>
                                <h3 className={styles.settingTitle}>Reset Settings</h3>
                                <p className={styles.settingDesc}>Reset all settings to default values</p>
                                <button 
                                    className={styles.dangerButton}
                                    onClick={() => {
                                        if (confirm('Are you sure you want to reset all settings?')) {
                                            useSettings.setState({ 
                                                settings: {
                                                    autoplay: false,
                                                    autoskip: false,
                                                    autonext: false,
                                                    load: 'idle',
                                                    audio: false,
                                                    herotrailer: true,
                                                    bannertrailer: true,
                                                    preferredPlayer: 'artplayer',
                                                    customBgColor: '#000000',
                                                    customAccentColor: '#ffffff',
                                                    bgImage: '',
                                                    bgImageOpacity: 0.3,
                                                    smoothScroll: false,
                                                    compactMode: false,
                                                    blurEffects: false,
                                                    animations: true,
                                                    cardHover: true,
                                                    hwAccel: true,
                                                    preloadImages: true,
                                                    debugMode: false,
                                                    analytics: true,
                                                    defaultProvider: 'animepahe',
                                                    homeSections: [
                                                        { id: 'promoBanner', label: 'Promo Banner', enabled: true },
                                                        { id: 'greeting', label: 'Greeting', enabled: true },
                                                        { id: 'continueWatching', label: 'Continue Watching', enabled: true },
                                                        { id: 'continueReading', label: 'Continue Reading', enabled: true },
                                                        { id: 'trendingNow', label: 'Trending Now', enabled: true },
                                                        { id: 'top10', label: 'Top 10 Anime', enabled: true },
                                                        { id: 'currentlyAiring', label: 'Currently Airing', enabled: true },
                                                        { id: 'premiumShowcase', label: 'Premium Collection', enabled: true },
                                                        { id: 'topRated', label: 'Top Rated', enabled: true },
                                                        { id: 'randomRecs', label: 'Random Recommendations', enabled: true },
                                                        { id: 'popularManga', label: 'Popular Manga', enabled: true },
                                                        { id: 'news', label: 'Latest News', enabled: true },
                                                        { id: 'upcoming', label: 'Upcoming Anime', enabled: true },
                                                        { id: 'genre', label: 'Genre Section', enabled: true },
                                                        { id: 'recentlyUpdated', label: 'Recently Updated', enabled: true }
                                                    ],
                                                }
                                            });
                                            localStorage.clear();
                                            window.location.reload();
                                        }
                                    }}
                                >
                                    Reset All Settings
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}

export default SettingsPage
