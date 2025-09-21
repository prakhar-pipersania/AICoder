# Documentation
## Project Structure
- Controllers/
  - ItemsController.cs
- Data/
  - InMemoryRepository.cs
- Interfaces/
  - IItemRepository.cs
  - IItemService.cs
- Models/
  - Item.cs
- Services/
  - ItemService.cs
- Program.cs
- Startup.cs
- WebApi.csproj

## File Descriptions
- **Models/Item.cs**: Defines the data structure for an Item, including Id, Name, and Description.
- **Interfaces/IItemRepository.cs**: Defines the contract for item data access operations (CRUD).
- **Data/InMemoryRepository.cs**: Implements `IItemRepository` using an in-memory list for data storage.
- **Interfaces/IItemService.cs**: Defines the contract for item business logic operations.
- **Services/ItemService.cs**: Implements `IItemService`, using `IItemRepository` to perform item-related operations.
- **Controllers/ItemsController.cs**: Handles incoming HTTP requests for items, interacting with `IItemService` and returning appropriate responses.
- **Startup.cs**: Configures the application services, middleware, and dependency injection for the ASP.NET Core application.
- **Program.cs**: The entry point of the application, responsible for creating and configuring the host.
- **WebApi.csproj**: Project file containing build configurations, dependencies, and target framework.

## Dependencies
- .NET SDK (version 8.0)
- ASP.NET Core
- Swashbuckle.AspNetCore (for Swagger UI)
- Microsoft.AspNetCore.Mvc.NewtonsoftJson
- Microsoft.Extensions.Logging.Abstractions

## Recent Changes
- **2023-10-27**:
  - **Created**: Models/Item.cs
  - **Updated**: Controllers/ItemsController.cs, Data/InMemoryRepository.cs, Interfaces/IItemRepository.cs, Services/ItemService.cs, Interfaces/IItemService.cs, Startup.cs, Program.cs
  - **Deleted**: None
- **2023-10-28**:
  - **Created**: Utilities/Logger.cs
  - **Updated**: Program.cs, Startup.cs, Controllers/ItemsController.cs, Services/ItemService.cs, Data/InMemoryRepository.cs
  - **Deleted**: None
- **2023-10-29**:
  - **Created**: None
  - **Updated**: .csproj, Program.cs, Startup.cs
  - **Deleted**: None
- **2023-10-30**:
  - **Created**: Controllers/ItemsController.cs, Data/InMemoryRepository.cs, Interfaces/IItemRepository.cs, Interfaces/IItemService.cs, Models/Item.cs, Services/ItemService.cs, WebApi.csproj
  - **Updated**: WebApi.csproj, Program.cs, Startup.cs, Controllers/ItemsController.cs, Data/InMemoryRepository.cs, Interfaces/IItemRepository.cs, Interfaces/IItemService.cs, Models/Item.cs, Services/ItemService.cs
  - **Deleted**: None
- **2023-11-15**:
  - **Updated**: WebApi.csproj
  - **Created**: None
  - **Deleted**: None

## TODOs
- Implement a persistent data store (e.g., Entity Framework with a database).
- Add more robust error handling and validation.
- Implement authentication and authorization.
- Write unit and integration tests.