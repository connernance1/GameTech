#include "Interpolation.hpp"

#include "components/Goal.hpp"
#include "components/Input.hpp"

#include <SFML/System/Vector2.hpp>
#include <iostream>

namespace systems
{
    // --------------------------------------------------------------
    //
    // Interested in entities that have both Movement and Position components,
    // but not if they have an Input component.  Furthermore, this
    // system adds an Goal component in order to properly update the
    // entity's state during the update stage.
    //
    // --------------------------------------------------------------
    bool Interpolation::addEntity(std::shared_ptr<entities::Entity> entity)
    {
        bool interested = false;
        if (System::addEntity(entity))
        {
            interested = true;
            if (!entity->hasComponent<components::Input>())
            {
                auto position = entity->getComponent<components::Position>();
                entity->addComponent(std::make_unique<components::Goal>(position->get(), position->getOrientation()));
            }
        }

        return interested;
    }

    // --------------------------------------------------------------
    //
    // Move each entity close to its goal.
    //
    // --------------------------------------------------------------
    void Interpolation::update(std::chrono::milliseconds elapsedTime)
    {
        for (auto&& [id, entity] : m_entities)
        {
            bool floating = true;
            if (entity->hasComponent<components::Goal>())
            {
                auto goal = entity->getComponent<components::Goal>();
                //
                // Protect against divide by 0 in addition to checking for remaining update window time
                if (goal->getUpdateWindow().count() != 0 && goal->getUpdatedTime() < goal->getUpdateWindow())
                {
                    floating = false;
                    auto position = entity->getComponent<components::Position>();

                    goal->setUpdatedTime(goal->getUpdatedTime() + elapsedTime);
                    auto updateFraction = static_cast<float>(elapsedTime.count()) / goal->getUpdateWindow().count();

                    //
                    // Turn first
                    position->setOrientation(position->getOrientation() - (goal->getStartOrientation() - goal->getGoalOrientation()) * updateFraction);
                    //
                    // Then move
                    position->set(
                        sf::Vector2f(
                            position->get().x - (goal->getStartPosition().x - goal->getGoalPosition().x) * updateFraction,
                            position->get().y - (goal->getStartPosition().y - goal->getGoalPosition().y) * updateFraction));
                }
            }
            if (floating)
            {
                // Just floating along based on momentum
                auto position = entity->getComponent<components::Position>();
                auto movement = entity->getComponent<components::Movement>();

                auto current = position->get();
                position->set(sf::Vector2f(
                    current.x + movement->getMomentum().x * elapsedTime.count(),
                    current.y + movement->getMomentum().y * elapsedTime.count()));
            }
        }
    } // namespace systems

} // namespace systems
