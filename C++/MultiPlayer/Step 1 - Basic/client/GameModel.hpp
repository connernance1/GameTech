#pragma once

#include "entities/Entity.hpp"
#include "messages/NotifyJoinSelf.hpp"
#include "messages/UpdateEntity.hpp"
#include "systems/KeyboardInput.hpp"
#include "systems/Network.hpp"
#include "systems/Renderer.hpp"

#include <SFML/Graphics.hpp>
#include <SFML/Window/Event.hpp>
#include <chrono>
#include <memory>
#include <unordered_set>

class GameModel
{
  public:
    bool initialize(sf::Vector2f viewSize);

    void signalKeyPressed(sf::Event::KeyEvent event);
    void signalKeyReleased(sf::Event::KeyEvent event);
    void update(const std::chrono::milliseconds elapsedTime, std::shared_ptr<sf::RenderTarget> renderTarget);

  private:
    // The purpose of this is to have a container that keeps the textures alive throughout the program
    std::unordered_set<std::shared_ptr<sf::Texture>> m_textures;
    sf::Vector2f m_viewSize;

    entities::EntityMap m_entities;
    entities::EntityMap m_entitiesKeyboardInput;
    entities::EntityMap m_entitiesRenderable;

    std::unique_ptr<systems::Network> m_systemNetwork;
    std::unique_ptr<systems::KeyboardInput> m_systemKeyboardInput;
    std::unique_ptr<systems::Renderer> m_systemRender;

    void addEntity(std::shared_ptr<entities::Entity> entity);
    void removeEntity(entities::Entity::IdType entityId);

    void handleNotifyJoinSelf(std::shared_ptr<messages::NotifyJoinSelf> message);
    void handleUpdateEntity(std::shared_ptr<messages::UpdateEntity> message);
};
